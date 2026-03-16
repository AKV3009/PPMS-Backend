import puppeteer from 'puppeteer';

export class PdfService {
    async generate(html: string): Promise<Buffer> {

        const browser = await puppeteer.launch({ headless: true });

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: 'domcontentloaded'
        });

        const pdfBytes = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();

        return Buffer.from(pdfBytes); // ⭐ fix
    }
}