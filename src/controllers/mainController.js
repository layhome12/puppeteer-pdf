import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import config from "../config/puppeteer.js";

export default class MainController {
  /**
   * @swagger
   * /generate/pdf:
   *   post:
   *     summary: Generate a single PDF
   *     tags:
   *       - PDF
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - docName
   *               - docHtml
   *             properties:
   *               docName:
   *                 type: string
   *                 example: 312100001.pdf
   *               docHtml:
   *                 type: string
   *                 example: "<h1>Invoice</h1>"
   *     responses:
   *       200:
   *         description: PDF generated successfully
   *       400:
   *         description: Missing docName or docHtml
   *       500:
   *         description: Internal server error
   */
  static async pdf(req, res) {
    try {
      const { docName, docHtml } = req.body;

      // -- validate
      if (!docName || !docHtml) {
        return res.status(400).json({
          message: "docName, docHtml is required",
        });
      }

      // -- init
      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(docHtml, {
        waitUntil: "networkidle0",
      });

      // -- generate
      const pdfBuffer = await page.pdf({
        format: config.paperSize,
        margin: config.margin,
        printBackground: true,
      });

      await browser.close();

      // -- save
      const savePath = path.resolve(config.savePath, docName);
      fs.writeFileSync(savePath, pdfBuffer);

      res.status(200).json({
        message: "Successfull generate PDF",
      });
    } catch (err) {
      res.status(500).json({
        message: "Failed to generate PDF",
        error: err.message,
      });
    }
  }

  /**
   * @swagger
   * /generate/bulk/pdf:
   *   post:
   *     summary: Generate multiple PDFs
   *     tags:
   *       - PDF
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               required:
   *                 - docName
   *                 - docHtml
   *               properties:
   *                 docName:
   *                   type: string
   *                   example: 312100001.pdf
   *                 docHtml:
   *                   type: string
   *                   example: "<h1>Invoice</h1>"
   *     responses:
   *       200:
   *         description: PDFs generated successfully
   *       400:
   *         description: Array is missing or empty
   *       500:
   *         description: Internal server error
   */
  static async pdfBulk(req, res) {
    try {
      const docs = req.body;

      // -- validate length
      if (!Array.isArray(docs) || docs.length == 0) {
        return res.status(400).json({
          message: "Docs mininum is 1 length",
        });
      }

      // -- max generate
      if (docs.length > config.maxGenerateBulk) {
        return res.status(400).json({
          message: `Docs maximun is ${config.maxGenerateBulk} length`,
        });
      }

      // -- validate docs
      for (const [i, doc] of docs.entries()) {
        if (!doc.docName || !doc.docHtml) {
          return res.status(400).json({
            message: `docName, docHtml is required (at index ${i})`,
          });
        }
      }

      // -- init puppeteer
      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      // -- generate
      const results = [];
      for (const doc of docs) {
        const { docName, docHtml } = doc;

        const page = await browser.newPage();
        await page.setContent(docHtml, {
          waitUntil: "networkidle0",
        });

        const pdfBuffer = await page.pdf({
          format: config.paperSize,
          margin: config.margin,
          printBackground: true,
        });

        await page.close();

        // -- save
        const savePath = path.resolve(config.savePath, docName);
        fs.writeFileSync(savePath, pdfBuffer);

        results.push({
          status: "00",
          docName,
        });
      }

      await browser.close();

      res.status(200).json({
        message: "Successfull generate bulk PDF",
        result: results,
      });
    } catch (err) {
      res.status(500).json({
        message: "Failed to generate bulk PDF",
        error: err.message,
      });
    }
  }
}
