import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        errors = []
        page.on("console", lambda msg: errors.append(f"{msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: errors.append(f"Uncaught exception: {err}"))
        
        await page.goto("http://localhost:8080/")
        
        # Click the Prompt Studio link
        try:
            await page.click("a[href='#promptstudio']")
            await page.wait_for_timeout(2000)
        except Exception as e:
            errors.append(f"Could not click link: {e}")
            
        print("Console Logs:")
        for e in errors:
            print(e)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
