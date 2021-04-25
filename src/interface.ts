export enum respCode {

  // ErrorNoAuthCode 未登录
	ErrorNoAuthCode = 0,

	// ErrorLoginAuthCode 已登录
	ErrorLoginAuthCode = 2,

	// LoginSuccess 登录成功
	LoginSuccess = 66,

	// ErrorUserAuthFailCode 账号密码错误
	ErrorUserAuthFailCode = 1,

	// ErrorMultipleDevicesCode 多台设备同时在线
	ErrorMultipleDevicesCode = 5

}

export interface queryInfoData {

	// code 值
	Code: respCode

	// Portalname 名称
	// Portalname: string

	// Time 时间
	Time: string

	// Flow 流量
	Flow: string

	// Xip 外网映射地址
	Xip: string

	// UID 用户名(`id`)
	UID: string

	// V4ip `ipv4` 地址
	V4ip: string

	// V6ip `ipv6` 地址
	V6ip: string

  HumanFlow: ()=> string

  HumanTime: ()=> string

}

export interface loginInfo {
  code: respCode
  msg: string
}