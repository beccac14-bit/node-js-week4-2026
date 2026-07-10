const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const initialUsers = require('../fixtures/users.json');

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的完整規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

// ───────────────────────────────────────────────────────────
// state（module 層級、這個 router 獨用）
// ───────────────────────────────────────────────────────────
// 複製 initialUsers，不改外部陣列。
// 預填管理員：{ id: 1, email: 'leo@gym.com', password: <bcrypt hash of '1q2w3e4r'> }
const users = [...initialUsers];
let nextId = initialUsers.length + 1;

const router = express.Router();

// ───────────────────────────────────────────────────────────
// TODO 任務二：POST /register
// ───────────────────────────────────────────────────────────

// POST /register
// - 輸入：body = { email, password }
// - 輸出：201 + { status: 'success', message: '註冊成功' }，或 400 + { status: 'false', message: '...' }
// - 提示：
//   1. email、password 缺少任何一個欄位，或 email 已存在（使用陣列方法檢查）→ return 400 跟對應輸出訊息
//   2. 密碼加密可使用 bcrypt 的 genSalt 與 hash 
//   3. 加密完成後，將新使用者（包含 id、email、加密後 password）存進 users，並 return 201 跟對應輸出訊息
// - 注意：handler 是 async function

// 作答區
router.post('/register', async (req, res, next) => { 

try {
// 錯誤 400：驗證 email password 兩個欄位是否都有
    const userInfo = req.body;
    const standardFields = ['email', 'password'];
    const validateFieldsResult = standardFields.filter(field => !userInfo[field]); // 如果有缺就回陣列

    if (validateFieldsResult.length > 0) {
        res.status(400).json( {status: 'false', message: `缺少必填欄位：${validateFieldsResult.join(', ')}`} );  
        return;
    }

// 錯誤 400：驗證 email 有無重複
    const userFound = users.find(user => user.email === userInfo.email);
    // users.find 回傳第一個符合條件的元素。若找不到任何符合的值，則回傳 undefined。

    if( userFound ){

        res.status(400).json( {status: 'false', message: `此 Email 已被使用`} );
        return; 

    };
    

// 密碼加密：bcrypt 的 genSalt 與 hash

const password = req.body.password;

  // 1. 產生 Salt（rounds = 10）
  const salt = await bcrypt.genSalt(10);

  // 2. 將密碼加鹽雜湊後儲存（模擬存入資料庫）
  const hashedPassword = await bcrypt.hash(password, salt);



// 將新使用者（包含 id、email、加密後 password）存進 users，並 return 201 跟對應輸出訊息

  const newMember = { id: nextId++, email: userInfo.email , password: hashedPassword };
  users.push(newMember);
  res.status(201).json({ status: 'success', message: '註冊成功' }); 
  // 注意避免 API 回傳的資訊產生個資洩漏的可能，所以這邊會建議使用 message: '註冊成功' 。

} catch(err) {
    next(err);
};

 });


// ───────────────────────────────────────────────────────────
// TODO 任務三：POST /login
// ───────────────────────────────────────────────────────────

// POST /login
// - 輸入：body = { email, password }
// - 輸出：200 + { status: 'success', token }，或 401 + { status: 'false', message: '帳號或密碼錯誤' }
// - 提示：
//   1. 從 users 找出 email 符合的使用者，如果找不到 → return 401 跟對應輸出訊息
//   2. 用 bcrypt.compare 比對密碼，如果不符合 → return 401 跟對應輸出訊息（兩種失敗回覆同樣訊息，避免帳號探測）
//   3. 用 jwt.sign 簽出 token，payload 帶入使用者的 id 和 email，secret 使用 process.env.JWT_SECRET，有效期設為 30 天
//   4. token 簽出後，回應 200 跟對應輸出訊息
// - 注意：handler 是 async function
// 作答區
router.post('/login', async (req, res, next) => { 

try{
// 錯誤 400：驗證 email 符合的使用者
    const userInfo = req.body;
    const userIndex = users.findIndex(user => user.email === userInfo.email);

    if(userIndex == -1){

        res.status(401).json( {status: 'false', message: `帳號或密碼錯誤`} );
        return; 

    };


// 錯誤 400：驗證 password 是否輸入正確
    const isMatch = await bcrypt.compare( userInfo.password , users[userIndex].password);
    if(!isMatch){

        res.status(401).json( {status: 'false', message: `帳號或密碼錯誤`} );
        return; 

    };


// 用 jwt.sign 簽出 token，payload 帶入使用者的 id 和 email，secret 使用 process.env.JWT_SECRET，有效期設為 30 天

    const payload = { id: users[userIndex].id, email: users[userIndex].email};
    const SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(payload, SECRET, {expiresIn : '30d'});
    res.status(200).json({ status: 'success', token});

} catch(err) {
    next(err);
};

});


// ───────────────────────────────────────────────────────────
// TODO 任務四：GET /me（受保護）
// ───────────────────────────────────────────────────────────

// GET /me
// - 保護：路由第二個參數掛上 verifyToken 守門員（驗過後會將使用者資料掛到 req.user）
// - 輸出：200 + { status: 'success', user: ... }
// 作答區
router.get('/me', verifyToken, (req, res, next) => { 

try{
    res.status(200).json({ status: 'success', user: req.user });

} catch(err){
    next(err);
};

});


module.exports = router;
