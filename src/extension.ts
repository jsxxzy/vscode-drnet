import * as vscode from 'vscode';
import { getPassword, getUsername } from './conf';

import drnet from './drnet'

const showMsg = (msg: string): void=> {
	const _msg = `[哆点] ${ msg }`
	vscode.window.showInformationMessage(_msg, `我知道了`);
}

export function activate(context: vscode.ExtensionContext) {

	const drNet = new drnet();

	let logoutAction = vscode.commands.registerCommand('vscode-drnet.logout', async ()=> {

		const hasLogin = await drNet.logout()
		showMsg(`网络${ hasLogin ? '已注销' : '注销失败, 未知错误' }`)

	});

	let checkAction = vscode.commands.registerCommand('vscode-drnet.check', async ()=> {

		const hasLogin = await drNet.hasLogin()
		showMsg(`网络${ hasLogin ? '已登录' : '未登录' }`)

	});

	let loginAction = vscode.commands.registerCommand('vscode-drnet.login', async ()=> {

		const u = getUsername(), p = getPassword()
		if (u != undefined && p != undefined) {
			const code = await drNet.login(u, p)
			showMsg(drNet.getRespString(code))
		} else {
			showMsg(`请设置账号密码!`)
		}

	});

	let queryAction = vscode.commands.registerCommand('vscode-drnet.query', async ()=> {

		const data = await drNet.query()
		let msg: string
		if (data.Code == 0) {
			msg = `当前网络未登录`
		} else {
			msg = `使用时间: ${ data.HumanTime() }, 流量: ${ data.HumanFlow() }`
		}
		showMsg(msg)

	})

	context.subscriptions.push(checkAction)
	context.subscriptions.push(queryAction)
	context.subscriptions.push(loginAction)
	context.subscriptions.push(logoutAction)

}

export function deactivate() {}
