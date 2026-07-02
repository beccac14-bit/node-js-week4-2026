const jwt = require('jsonwebtoken');

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的完整規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

// ───────────────────────────────────────────────────────────
// TODO 任務一：JWT 守門員（verifyToken）
// ───────────────────────────────────────────────────────────

// - 輸入：req.headers.authorization（格式：'Bearer <token>'）
// - Authorization 格式驗證：沒帶或不符合 'Bearer <token>' 格式 → return 401 + { status: 'false', message: '請先登入' }
// - Token 驗證：取出 authorization 中 Bearer 後的 token，在 try/catch 中以 jwt.verify 驗證（secret 用 process.env.JWT_SECRET）；
//   驗證成功則將 decoded 掛到 req.user 並呼叫 next()；
//   驗證失敗（拋出例外）→ catch 中 return 401 + { status: 'false', message: 'Token 無效或已過期' }

/**
 * JWT 守門員：驗 Authorization header 的 Bearer token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const verifyToken = function (req, res, next) {
  /* 作答區 */
  const headerAuth = req.headers.authorization; 
  
  if( !headerAuth || !headerAuth.startsWith('Bearer ') ){
    res.status(401).json({ status: 'false', message: '請先登入' });
    return;
  };

  const token = req.headers.authorization.split(' ')[1];
  const SECRET = process.env.JWT_SECRET;

  try{

    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  
  } catch(error) {

    res.status(401).json( { status: 'false', message: 'Token 無效或已過期' } );
  
  }



};

module.exports = verifyToken;
