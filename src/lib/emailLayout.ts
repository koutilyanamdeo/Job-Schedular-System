// src/lib/emailLayout.ts

export const wrapHtmlContent = (content: string): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
            }
            .header {
                background-color: #4f46e5;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .body-content {
                padding: 30px;
                background-color: #ffffff;
            }
            .footer {
                background-color: #f9fafb;
                padding: 15px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Job Notification</h1>
            </div>
            <div class="body-content">
                ${content} 
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
                <p>You received this because a scheduled job was triggered.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};