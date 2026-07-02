const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const authRouter = require('./routes/auth');
const swaggerDoc = require('./fixtures/swagger.json');

const app = express();

// ───────────────────────────────────────────────────────────
// TODO 任務五：將 middleware、router、守門員依序掛上 app
// ───────────────────────────────────────────────────────────
// 1. cors()
// 2. express.json()
// 3. Swagger UI /docs（已預先提供如下，同學不需調整）
// 4. /auth router
// 5. 404 守門員（無此路由資訊）
// 6. 錯誤處理守門員（⚠️ 4 個參數、最後一個）
//    回傳 status 500，body 包含兩個欄位：
//    - err：錯誤的類別名稱（例如 'SyntaxError'）
//    - message：錯誤訊息
//
// ⚠️ **最後不需呼叫 app.listen()** — 這個部分交由 server.js 負責（分離「組裝」跟「啟動」，這樣 test.js 可以 supertest 直接戳 app、不佔 port）。

// 1. cors()
    app.use(cors());
// 2. express.json()
    app.use(express.json());
// 3. Swagger UI /docs（已預先提供如下，同學不需調整）
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
// 4. /auth router
    app.use('/auth', authRouter);
// 5. 404 守門員（無此路由資訊）
    // 404 防呆（app.use 會匹配所有未定義的路徑）
        app.use( (req, res)=> {
        res.status(404).json({ status: 'error', message: '路由不存在' });
        });
  
// 6. 錯誤處理守門員（⚠️ 4 個參數、最後一個）
//    回傳 status 500，body 包含兩個欄位：
//    - err：錯誤的類別名稱（例如 'SyntaxError'）
//    - message：錯誤訊息

    app.use((err, req, res, next) => {
    // 將詳細錯誤印出在伺服器終端機，方便開發者除錯
        console.log('伺服器錯誤:', err.message);

    // 回傳 500 狀態碼與 JSON 錯誤訊息給前端
    if (err instanceof SyntaxError) {
        return res.status(500).json({
        err: err.name, // 這裡會呈現 "SyntaxError"
        message: '伺服器內部錯誤，請稍後再試。'
        });
    }
        /* 
        常見的 SyntaxError 場景：
        在 Node.js 後端最常見的 SyntaxError，
        通常是前端發送 POST 請求時，
        body 的 JSON 格式寫錯（例如少了一個逗號、多了一個引號）。
        */

    // 其他非語法錯誤的處理（保險起見一併捕捉）
    return res.status(500).json({
        err: 'InternalServerError',
        message: '系統發生未知錯誤。'
    });

    });

module.exports = app;
