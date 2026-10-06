import CryptoJS from 'crypto-js'

const pepper = import.meta.env.VITE_APP_PEPPER || '123456'

export const cifrar = (texto) => {
  var textoCifrado = CryptoJS.AES.encrypt(texto, '12345678').toString()
  return textoCifrado
}

export const descifrar = (texto) => {
  var bytes = CryptoJS.AES.decrypt(texto, '12345678')
  var textoDescifrado = bytes.toString(CryptoJS.enc.Utf8)
  return textoDescifrado
}

export const hashear = (texto) => {
  var newMsg = texto + pepper
  var hash = CryptoJS.SHA512(newMsg).toString(CryptoJS.enc.Base64)
  return hash
}
