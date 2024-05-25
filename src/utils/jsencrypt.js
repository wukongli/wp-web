import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'
import Cookies from "js-cookie";

// 密钥对生成 http://web.chacuo.net/netrsakeypair
const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALBG1hY69Hu9s1pnDOBr+6ASbfaUPxV2PX6Xgnd/4Juud+f90qOQ4/ywBqJKYcZSaLx+3woVY75ynFFv1sfAzo8CAwEAAQ=='

const privateKey = 'MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEAnQti1AN8L3vcFuOF\nyuljxqlSneLA8T1jyd/ARaF3xS4iw3CZyZ8RaWHMqN+qxnKGTwW5qJNcY23L+ij3\n8wICXwIDAQABAkAE5Ari4WznqarUB6fuBtC1qiZJhntNyASoj9BUGtA5EsdA9uYa\nyoIuVi+RV5Lr1zGC4LPqRENlRCAiT8RqmYuJAiEA0C4ZvqBWa+AZJNScig9Ag0uF\nBwPbxacurs6tKq4gPkUCIQDBHknNh0dFOfeD4+xMUBQdmHw1WA7N24nRu3z2/aSq\nUwIhAIUZhHJBdx+fdtP6b19BoyCOry2uBNxZKFqxXzvTel/1AiAhQy5DEEHeUpWn\nSeKxYjmUv2blaT1jh6S9UyW7BQUPsQIhAJY7XyO/gjAcNuezs/a51vD4ZX4N0zaQ\nZkTjdcjRbDBr'

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}

