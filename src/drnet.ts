import http from 'got'
import * as cheerio from 'cheerio'
import * as crypto from 'crypto'

import * as vm from 'vm'

import { queryInfoData, respCode } from './interface'
import byte from './byte'
import timebyte from './timebyte'

export default class drnet {

  private _baseURL: string = "http://210.22.55.58"

  private calg = "12345678"

  private pid = "2"

  private _createURL = (abs: string): string => {
    return `${ this._baseURL }/${ abs }`
  }

  private _createMD5 = (rawStr: string): string => {
    return crypto.createHash('md5').update(rawStr).digest("hex")
  }

  private _loginURL: string = this._createURL("0.htm")

  private _logoutURL: string = this._createURL("F.htm")

  private _callVmCode = ($: string | cheerio.Root): queryInfoData | any => {
    const sanbox: queryInfoData | any = {}
    if (typeof $ == 'string') {
      $ = cheerio.load($)
    }
    const scripts = $("script[language=\"JavaScript\"]").html()
    if (scripts == null) return sanbox
    const arr = scripts.split("\n")

    arr.pop() // 去除 <!-- -->
    arr.shift()

    const codes = arr.join("\n")

    try {
      const VM = new vm.Script(codes)
      const runInContext = vm.createContext(sanbox)
      VM.runInContext(runInContext)
    } catch (error) {
      console.error(error)
    }
    return sanbox
  }

  public createPassword = (pwd: string): string => {
    const tmp = this.pid + pwd + this.calg
    return this._createMD5(tmp) + this.calg + this.pid
  }

  public getRespString(code: respCode) {
    switch (code) {
      case respCode.ErrorLoginAuthCode:
        return "已登录"
      case respCode.ErrorNoAuthCode:
        return "未登录"
      case respCode.LoginSuccess:
        return "登录成功"
      case respCode.ErrorUserAuthFailCode:
        return "账号密码错误"
      case respCode.ErrorMultipleDevicesCode:
        return "多台设备同时在线"
      default:
        return "未知错误"
    }
  }

  public async login(u: string, p: string): Promise<respCode> {
    const _p = this.createPassword(p)
    const resp = await http.post("http://localhost:8080/", {
      form: {
        "DDDDD": u,
        "upass": _p,
        "R1": 0,
        "R2": 1,
        "para": "00",
        "0MKKey": "123456",
        "v6ip": "",
      }
    })
    if (resp.statusCode != 200) return respCode.ErrorNoAuthCode
    const sanbox = this._callVmCode(resp.body)
    let m = sanbox?.Msg
    let ms = sanbox?.msga

    if (m == null && ms == null) return respCode.LoginSuccess
    if (ms != null) {
      switch (ms) {
        case "5":
          return respCode.ErrorMultipleDevicesCode
        case "1":
          return respCode.ErrorUserAuthFailCode
      }
    }
    return respCode.ErrorNoAuthCode
  }

  public async logout(): Promise<boolean> {
    return (await http.get(this._logoutURL)).statusCode == 200
  }

  public async hasLogin(): Promise<boolean> {
    const info = await this.query()
    return info.Code != 0
  }

  public async query(): Promise<queryInfoData> {
    const resp = await http(this._baseURL)
    const data = resp.body
    const $ = cheerio.load(data)
    const info: queryInfoData = {
      Code: respCode.ErrorNoAuthCode,
      Time: "",
      Flow: "",
      Xip: "",
      UID: "",
      V4ip: "",
      V6ip: "",
      HumanFlow: function () {
        return byte(+this.Flow)
      },
      HumanTime: function () {
        return timebyte(+this.Time)
      }
    }
    const title = $("title").text().trim()
    if (title.length >= 2) info.Code = respCode.ErrorLoginAuthCode

    try {

      const sanbox = this._callVmCode($)

      info.Flow = (sanbox.flow1 / 1024) + sanbox.flow3 + (sanbox.flow0 / 1024)

      info.Time = sanbox.time?.trim()

      info.UID = sanbox.uid

      info.V4ip = sanbox.v4ip

      info.V6ip = sanbox.v6ip

      info.Xip = sanbox.xip

      // console.log('f: ', info.HumanFlow());
      // console.log('t: ', info.HumanTime());

    } catch (error) {
      console.error(error)
    }

    return info
  }

}