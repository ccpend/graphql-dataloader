import { request } from 'graphql-request';
import { parse, print } from 'graphql/language';
import DataLoader from 'dataloader';
import { makeRandomId, deepFindHandle } from './util';

export default class GraphQLDataLoader {

  /**
   * GraphQL api url
   */
  endpoint;

  /**
   * 构造函数
   * @param endpoint
   * @param options
   */
  constructor(endpoint, options = {}) {
    const defaultOption = {
      cache: false,
      maxBatchSize: 50,
    };

    this.endpoint = endpoint;
    this.loader = new DataLoader(
      keys => this.loaderHandler(keys),
      Object.assign(defaultOption, options)
    );
  }

  /**
   * 不合并的原始请求
   * @param query
   * @param variables
   * @return {Promise<any>}
   */
  originalRequest(query, variables = {}) {
    return request(this.endpoint, query, variables);
  }

  /**
   * 合并的dataLoader请求
   * @param query
   * @param variables
   * @return {Promise.<V>|Promise<V>}
   */
  request(query, variables = {}) {
    return this.loader.load(JSON.stringify({
      query: parse(query),
      variables,
    }));
  }

  /**
   * dataLoader处理逻辑
   * @param keys
   * @return {Promise.<*>}
   */
  async loaderHandler(keys) {
    const querySelections = [];
    const otherDefinitions = [];
    const variableDefinitions = [];
    const separator = `_${makeRandomId(6)}_`;
    const newVariables = {};

    keys.forEach((item, batchIndex) => {
      const jsonObjectData = JSON.parse(item);
      const { variables } = jsonObjectData;
      const tmpVariablesMapping = {};
      const tmpFragmentMapping = {};
      let { query: queryDSL } = jsonObjectData;
      let hasFirstQuery = false;
      queryDSL = deepFindHandle(queryDSL, 'kind', 'Variable', object => {
        if (object.name && object.name.value) {
          const oldKey = object.name.value;
          if (variables.hasOwnProperty(oldKey)) {
            let newKey = '';
            if (tmpVariablesMapping.hasOwnProperty(oldKey)) {
              newKey = tmpVariablesMapping[oldKey];
            } else {
              newKey = `${oldKey}_${makeRandomId(6)}`;
              newVariables[newKey] = variables[oldKey];
              tmpVariablesMapping[oldKey] = newKey;
            }

            object.name.value = newKey;
          }
        }

        return object;
      });

      deepFindHandle(queryDSL, 'kind', 'FragmentSpread', object => {
        if (object.name && object.name.value) {
          const oldName = object.name.value;
          let newName = '';
          if (tmpFragmentMapping.hasOwnProperty(oldName)) {
            newName = tmpFragmentMapping[oldName];
          } else {
            newName = `${oldName}_${makeRandomId(6)}`;
            tmpFragmentMapping[oldName] = newName;
          }

          object.name.value = newName;
        }

        return object;
      });

      queryDSL.definitions.forEach(definition => {
        if (
          definition.operation === 'query' &&
          definition.selectionSet &&
          definition.selectionSet.selections &&
          !hasFirstQuery
        ) {
          hasFirstQuery = true;
          definition.selectionSet.selections.forEach(selection => {
            selection = { ... selection };
            const queryName = (selection.name && selection.name.value) || '';
            if (queryName) {
              let funcQueryName = `${queryName}${separator}${batchIndex}`;
              // 如果有别名
              if (selection.alias && selection.alias.value) {
                funcQueryName += `${separator}${selection.alias.value}`;
              }

              selection.alias = {
                kind: 'Name',
                value: funcQueryName,
              };

              querySelections.push(selection);
            }
          });

          if (definition.variableDefinitions) {
            variableDefinitions.push(definition.variableDefinitions);
          }
        } else if (definition.kind === 'FragmentDefinition') {
          const oldFragmentName = definition.name.value;
          if (tmpFragmentMapping.hasOwnProperty(oldFragmentName)) {
            definition.name.value = tmpFragmentMapping[oldFragmentName];
          }

          otherDefinitions.push(definition);
        } else {
          otherDefinitions.push(definition);
        }
      });
    });

    // todo directives 是什么意义
    const queryDefinition = [{
      directives: [],
      kind: "OperationDefinition",
      operation: "query",
      selectionSet: {
        kind: "SelectionSet",
        selections: querySelections,
      },
      variableDefinitions,
    }];

    const query = print({
      kind: "Document",
      definitions: [...queryDefinition, ...otherDefinitions]
    });

    return GraphQLDataLoader.dispatchResult(await request(this.endpoint, query, newVariables), separator);
  }

  /**
   * 分发最后的结果给dataloader
   * @param result
   * @param separator
   * @return {*}
   */
  static dispatchResult(result, separator) {
    const ret = [];
    Object.keys(result).forEach(key => {
      const [funcName, index, aliasName] = key.split(separator);
      const name = aliasName || funcName;
      if (!ret[index]) {
        ret[index] = {
          [name]: result[key]
        };
      } else {
        ret[index][name] = result[key];
      }
    });

    return ret;
  }
}
