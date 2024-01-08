# NodeJS GraphQL API with apollo server
This API is implemented with graphQL which web scrapes data from https://gsmarena.com

## Installation
```
npm i
```

## Run application
```
npm run start
```

To test the API queries, click on https://localhost:4000/graphql

Guide for the API
### To get all the brand names
```graphql
getAllBrands {
    name
    slug
  }
```
### To get the list of mobile phones
```graphql
  getDevicesByBrand(brandSlug: $brandSlug) {
    imageUrl
    productName
    slug
  }
```
brandSlug :- Slug received from the repective brands from getAllBrands call

### To get the mobile phones details
```graphql
  getDeviceDetails(mobileSlugs: $mobileSlugs) {
    products  
    title
  }
```
mobileSlug :- Slug received from the repective mobiles from getDevicesByBrand call

The above calls can also be combined as below. (feel free to playaround)
```graphql
getAllBrands(brandName: $brandName) {
    name
    device {
      imageUrl
      productName
      deviceDetails {
        products
        title
      }
    }
  }
```
This gets the list of all the mobiles of the specified brands with details.

