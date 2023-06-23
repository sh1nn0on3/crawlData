// hàm cào tổng
const scrapeCategory = (browser, url) =>
  new Promise(async (res, rej) => {
    try {
      let page = await browser.newPage();
      console.log(">> mở ra tab mới ...");
      await page.goto(url);
      console.log(">> Truy cập vào " + url);
      //   await page.waitForSelector("#default");
      console.log(">> Website đã load xog ...");

      const dataCategory = await page.$$eval(
        "body > div.header > div.header-bottom > div > div > div.header-menu > div.menu_holder > div",
        (els) => {
          dataCategory = els.map((el) => {
            return {
              category: el.querySelector("p").innerText,
              link: el.querySelector("a").href,
            };
          });
          return dataCategory;
        }
      );
      await page.close();
      console.log(">> Đã đóng");
      res(dataCategory);
    } catch (error) {
      console.log("lỗi ở scrape category" + error);
      rej(error);
    }
  });

// hàm scraper
const scraper = (browser, link) =>
  new Promise(async (res, rej) => {
    try {
      let newPage = await browser.newPage();
      console.log(">> Mở ra tab mới ...");
      await newPage.goto(link);
      console.log(">> Truy cập vào url " + link);
      // await newPage.waitForSelector(".page_inner");
      console.log(">> Page đã load xog ...");

      const scrapeData = {};

      //----- lấy link details item -------
      const detailsLinks = await newPage.$$eval(
        " div.product-category > div > div.product-list.d-flex.flex-wrap > div > div.product-img",
        (els) => {
          detailsLinks = els.map((el) => {
            return el.querySelector("a").href;
          });
          return detailsLinks;
        }
      );

      // console.log(detailsLinks);
      const scraperDetail = (link) =>
        new Promise(async (res, rej) => {
          try {
            let pageDetail = await browser.newPage();
            console.log(">> Mở ra link mới ...");
            await pageDetail.goto(link);
            console.log(">> truy cập " + link);
            //   await pageDetail.waitForSelector("#content_inner");
            console.log(">> Đã lấy được data ...");

            const detailData = {};
            // hàm cạo
            // cạo image
            const images = await pageDetail?.$eval(
              "#product-big > a ",
              (el) => {
                return el.querySelector("img")?.src;
              }
            );
            const name = await pageDetail.$eval(
              "body > main > div.product-detail > div ",
              (el) => {
                return el.querySelector("h1").innerText;
              }
            );
            const price = await pageDetail.$eval(
              "body > main > div.product-detail > div > div.main-product-detail.d-flex > div.main-product-mid ",
              (el) => {
                return el.querySelector("div").innerText;
              }
            );
            // detail
            const cpu = await pageDetail.$eval("#attr-cpu > ul > li", (el) => {
              return el.querySelector("span").innerText;
            });
            // const ram = await pageDetail.$eval("#attr-ram > ul > li", (el) => {
            //   return el.querySelector("span").innerText;
            // });
            const ssd = await pageDetail?.$eval(
              "#attr-o-cung > ul > li",
              (el) => {
                return el.querySelector("span")?.innerText;
              }
            );
            const card = await pageDetail?.$eval(
              "#attr-card-do-hoa > ul > li",
              (el) => {
                return el.querySelector("span")?.innerText;
              }
            );
            const man = await pageDetail.$eval(
              "#attr-man-hinh > ul > li",
              (el) => {
                return el.querySelector("span").innerText;
              }
            );
            //
            detailData.name = name;
            detailData.images = images;
            detailData.price = price;
            detailData.cpu = cpu;
            // detailData.ram = ram;
            detailData.ssd = ssd;
            detailData.card = card;
            detailData.man = man;
            //

            // ------------------------------

            await pageDetail.close();
            res(detailData);
          } catch (error) {
            console.log("lỗi ở scraperDetail " + error);
            rej(error);
          }
        });

      // --------- lọc và lưu cái data vừa cào ---------
      const details = [];
      for (let link of detailsLinks) {
        const detail = await scraperDetail(link);
        details.push(detail);
      }

      // -------- lưu details vào scrapeData-------
      scrapeData.body = details;

      // ------ hàm kết ---------
      await newPage.close();
      console.log(">> Trình duyệt đã đóng");
      res(scrapeData);
    } catch (error) {
      console.log("lỗi ở scraper " + error);
      rej(error);
    }
  });

module.exports = { scrapeCategory, scraper };
