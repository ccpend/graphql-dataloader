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

This is just a trial version!!!

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
query ($bookStoreFilter_6hD5OG: bookStoreFilter!,$bookCategoryFilter_X2NbDW: bookCategoryFilter!,$schoolFilter_WA2hvm: schoolFilter!, $fetchBookStoreFilter_KXv0B6: fetchBookStoreFilter!,$fetchSchoolFilter_k4xyev: fetchSchoolFilter!, $userFilter: getUserParamsFilter!,$areaFilter: singleAreaByIdFilter!) {
  getBookStore_3AMi6s_0: getBookStore(filter: $bookStoreFilter_6hD5OG) {
    storeInfo {
      name
    }
    firstBook: book(filter: {id: "1"}) {
      name
    }
    book(filter: $bookCategoryFilter_X2NbDW) {
      id
      name
    }
  }
  getSchool_3AMi6s_0: getSchool(filter: $schoolFilter_WA2hvm) {
    name
  }
  fetchBookStore_3AMi6s_1: fetchBookStore(filter: $bookStoreFilter) {
    storeInfo {
      name
      district
      address
    }
  }
  fetchSchool_3AMi6s_1: fetchSchool(filter: $fetchSchoolFilter_k4xyev) {
    name
  }
  fetchWarehouse_3AMi6s_1: fetchWarehouse(filter: $fetchWarehouseFilter_tb0JHH) {
    id
    location {
      latitude
      longitude
    }
  }
  fetchWarehouse_3AMi6s_2_3AMi6s_SF_Warehouse: fetchWarehouse(filter: {city: "SF"}) {
    id
    address
  }
  fetchWarehouse_3AMi6s_2_3AMi6s_LA_Warehouse: fetchWarehouse(filter: {city: "LA"}) {
    id
    address
  }
}
```

* These variables are:
```js
{
  bookStoreFilter_6hD5OG: { id: 10 },
  bookCategoryFilter_X2NbDW: { category: 'technology' },
  schoolFilter_WA2hvm: { id: 100 },
  fetchBookStoreFilter_KXv0B6: { city: 'NY' },
  fetchSchoolFilter_k4xyev: { city: 'NY' },
  fetchWarehouseFilter_tb0JHH: { city: 'NY' }
}
```
