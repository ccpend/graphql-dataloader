graphql-dataloader
================================

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]
[![license][license-image]][license-url]

[npm-image]: https://img.shields.io/npm/v/graphql-dataloader.svg?style=flat-square
[npm-url]: https://npmjs.org/package/graphql-dataloader
[travis-image]: https://img.shields.io/travis/BigMaster/graphql-dataloader.svg?style=flat-square
[travis-url]: https://travis-ci.org/BigMaster/graphql-dataloader
[codecov-image]: https://codecov.io/gh/BigMaster/graphql-dataloader/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/BigMaster/graphql-dataloader
[david-image]: https://img.shields.io/david/BigMaster/graphql-dataloader.svg?style=flat-square
[david-url]: https://david-dm.org/BigMaster/graphql-dataloader
[snyk-image]: https://snyk.io/test/npm/graphql-dataloader/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/graphql-dataloader
[download-image]: https://img.shields.io/npm/dm/graphql-dataloader.svg?style=flat-square
[download-url]: https://npmjs.org/package/graphql-dataloader
[license-image]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]: https://opensource.org/licenses/MIT

* Install the npm package as a dependency `npm i graphql-dataloader --save`.
* Multiple GraphQL requests are merged into one large query and sent in an event loop.

```js
import { GraphQLDataLoader } from 'graphql-dataloader';
const loader = new GraphQLDataLoader('http://localhost:4001/graphql');

const firstQuery = `
  query firstQuery(
    $bookStoreFilter: bookStoreFilter!
    $bookCategoryFilter: bookCategoryFilter!
    $schoolFilter: schoolFilter!
  ) { 
    getBookStore(filter: $bookStoreFilter) {
      storeInfo {
        name
      }
      
      firstBook: book(filter: {id: "1"}) {
        name
      }
      
      book(filter: $bookCategoryFilter) {
        id
        name
      }
    }
    
    getSchool(filter: $schoolFilter) {
      name  
    }
  }
`;

const firstQueryVariables = {
  bookStoreFilter: {
    id: 10,
  },
  bookCategoryFilter: {
    category: 'technology',
  },
  schoolFilter: {
    id: 100,
  },
};

const secondQuery = `
  query secondQuery(
    $fetchBookStoreFilter: fetchBookStoreFilter!
    $fetchSchoolFilter: fetchSchoolFilter!
  ) {
    fetchBookStore(filter: $bookStoreFilter) {
      storeInfo {
        name
        district
        address
      }
    }
    
    fetchSchool(filter: $fetchSchoolFilter) {
      name  
    }
    
    fetchWarehouse(filter: $fetchWarehouseFilter) {
      id
      location {
        latitude
        longitude
      }
    }
  }
`;

const secondQueryVariables = {
  fetchBookStoreFilter: {
    'city': 'NY',
  },
  fetchSchoolFilter: {
    'city': 'NY',
  },
  fetchWarehouseFilter: {
    'city': 'NY',
  },
};

const thirdQuery = `
  query thirdQuery(
    $userFilter: getUserParamsFilter!
    $areaFilter: singleAreaByIdFilter!
  ) {
    SF_Warehouse: fetchWarehouse(filter: {city: "SF"}) {
      id
      address
    }
    
    LA_Warehouse: fetchWarehouse(filter: {city: "LA"}) {
      id
      address
    }
  }
`;

const thirdQueryVariables = {
};

async function request(query, variables = {}) {
  const res = await loader.request(query, variables);
  console.log(res);
}

request(firstQuery, firstQueryVariables);
request(secondQuery, secondQueryVariables);
request(thirdQuery, thirdQueryVariables);
```

* The compiled GraphQL query statement is:

```graphql
query ($bookStoreFilter_wEJaW7: bookStoreFilter!,$bookCategoryFilter_68UmMW: bookCategoryFilter!,$schoolFilter_29jQNC: schoolFilter!, $fetchBookStoreFilter_xTNrIb: fetchBookStoreFilter!,$fetchSchoolFilter_mpHhqy: fetchSchoolFilter!, ) {
  getBookStore_U7TVvc_0: getBookStore(filter: $bookStoreFilter_wEJaW7) {
    storeInfo {
      name
    }
    firstBook: book(filter: {id: "1"}) {
      name
    }
    book(filter: $bookCategoryFilter_68UmMW) {
      id
      name
    }
  }
  getSchool_U7TVvc_0: getSchool(filter: $schoolFilter_29jQNC) {
    name
  }
  fetchBookStore_U7TVvc_1: fetchBookStore(filter: $bookStoreFilter) {
    storeInfo {
      name
      district
      address
    }
  }
  fetchSchool_U7TVvc_1: fetchSchool(filter: $fetchSchoolFilter_mpHhqy) {
    name
  }
  fetchWarehouse_U7TVvc_1: fetchWarehouse(filter: $fetchWarehouseFilter_pThtEr) {
    id
    location {
      latitude
      longitude
    }
  }
  fetchWarehouse_U7TVvc_2_U7TVvc_SF_Warehouse: fetchWarehouse(filter: {city: "SF"}) {
    id
    address
  }
  fetchWarehouse_U7TVvc_2_U7TVvc_LA_Warehouse: fetchWarehouse(filter: {city: "LA"}) {
    id
    address
  }
}
```

* These variables are:
```js
{
  bookStoreFilter_wEJaW7: { id: 10 },
  bookCategoryFilter_68UmMW: { category: 'technology' },
  schoolFilter_29jQNC: { id: 100 },
  fetchBookStoreFilter_xTNrIb: { city: 'NY' },
  fetchSchoolFilter_mpHhqy: { city: 'NY' },
  fetchWarehouseFilter_pThtEr: { city: 'NY' }
}
```
