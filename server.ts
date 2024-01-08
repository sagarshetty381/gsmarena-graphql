
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
import * as bodyParser from 'body-parser';
const cors = require('cors');
import WebScrapeController from './src/products.controller'
import GraphQLJSON from 'graphql-type-json';

async function startApolloServer() {
    const app = express();
    const server = new ApolloServer({
        typeDefs: `
            scalar JSON
            type Brand {
                name: String!
                slug: String!
                device: [Device]
            }

            type Device {
                productName: String!
                imageUrl: String!
                slug: String!
                deviceDetails: [DeviceDetails]
            }

            type DeviceDetails {
                title: String!
                products: JSON
            }

            type Query {
                getAllBrands(brandName: String) : [Brand],
                getDevicesByBrand(limit: Int, brandSlug: String!): [Device],
                getDeviceDetails(mobileSlugs: [String!]!): [DeviceDetails]
            }
        `,
        resolvers: {
            JSON: GraphQLJSON,
            Brand: {
                device: async (parent: any) => {
                    return await WebScrapeController.getProductsByBrand(10, parent.slug);
                }
            },
            Device: {
                deviceDetails: async (parent: any) => {
                    return await WebScrapeController.getProductsDetails([parent.slug]);
                }
            },
            Query: {
                getAllBrands: async (parent: any, { brandName = null }) => await WebScrapeController.getAllBrandNames(brandName),
                getDevicesByBrand: async (parent: any, { limit = 10, brandSlug = null }) => {
                    return await WebScrapeController.getProductsByBrand(limit, brandSlug)
                },
                getDeviceDetails: async (parent: any, { mobileSlugs = [] }) => {
                    return await WebScrapeController.getProductsDetails(mobileSlugs)
                }
            }
        }
    });

    app.use(bodyParser.json({}));
    app.use(cors());

    await server.start();
    app.use('/graphql', expressMiddleware(server));

    app.listen(4000, () => {
        console.log("Server started at port 4000.")
    })
}

startApolloServer();