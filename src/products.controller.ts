import axios from "axios";
const cheerio = require('cheerio');

class WebScrapeController {
    public url = 'https://www.gsmarena.com';

    public async getAllBrandNames(brand: string | null) {
        try {
            const pageHTML = await axios.get(this.url);
            const brandNames: any = [];
            const $ = cheerio.load(pageHTML.data);
            $(".brandmenu-v2 li a").each((index: any, element: any) => {
                if (brand !== null && brand !== $(element).text()) { 
                    return;
                }
                const brandName = $(element).text()
                const slug = $(element).attr('href')
                brandNames.push({ name: brandName, slug });
            })
            return brandNames;
        } catch (error) {
            console.log(error)
        }
    }

    public getProductsByBrand = async (limit = 10, brandSlug = null) => {
        try {
            const brandProducts: any = [];
            let paginatedIndex = 0;

            const $ = await this.getDomStructure(`${this.url}/${brandSlug}`);

            $(".makers li a").each((index: any, element: any) => {
                const productName = $(element).text();
                const slug = $(element).attr("href");
                const imageUrl = $(element).children("img").attr("src");

                brandProducts.push({ productName, imageUrl, slug });
            });

            const pagesDom = $(".nav-pages a");
            const totalPages = pagesDom.length;
            while (brandProducts.length < limit && paginatedIndex <= totalPages-1) {
                const nextPageSlug = pagesDom[paginatedIndex].attributes[0].value;
                const nextDom = await this.getDomStructure(`${this.url}/${nextPageSlug}`);
                nextDom(".makers li a").each((index: any, element: any) => {
                    const productName = nextDom(element).text();
                    const slug = nextDom(element).attr("href");
                    const imageUrl = nextDom(element).children("img").attr("src");

                    brandProducts.push({ productName, imageUrl, slug });
                });
                paginatedIndex++;
            }
            const resArray = brandProducts.length > limit ? brandProducts.slice(0,limit): brandProducts;
            return resArray;
        } catch (error) {
            console.log(error)
        }
    }

    public async getProductsDetails(mobileSlugs: String[] = []) {
        try {
            const pageHTMLPromiseArr: any = [];
            const res: any = {
                payload: [],
                message: "Products received successfully"
            };

            for (const i in mobileSlugs) {
                pageHTMLPromiseArr.push(axios.get(`${this.url}/${mobileSlugs[i]}`).then((res) => {
                    const responseData = cheerio.load(res.data);
                    return responseData;
                }));
            }
            const pageHTML = await Promise.all(pageHTMLPromiseArr);
            for (const i in pageHTML) {
                const productDetail: any = {};
                const title = pageHTML[i](".specs-phone-name-title").text()
                pageHTML[i]("tbody").each((index: any, row: any) => {
                    const header = pageHTML[i]("th", row).text();
                    productDetail[header] = {}
                    const subHeader = pageHTML[i](".ttl", row);
                    const subData = pageHTML[i](".nfo", row);

                    subHeader.each((index: any, rowData: any) => {
                        const data = subData[index].children[0].data || subData[index].children[0].children[0].data;
                        productDetail[header][pageHTML[i]("a", rowData).text()] = data;
                    })
                });
                res.payload.push({ title, products: productDetail })
            }
            return res.payload;
        } catch (error) {
            console.log(error)
        }
    }

    public async getDomStructure(url: any) {
        const pageHTML = await axios.get(url);
        return cheerio.load(pageHTML.data);
    }
}

export default new WebScrapeController();