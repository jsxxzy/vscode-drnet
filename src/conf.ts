import * as vscode from 'vscode'

export const getUsername = (): string | undefined=> vscode.workspace.getConfiguration('vscode-drnet').get('username')

export const getPassword = (): string | undefined=> vscode.workspace.getConfiguration('vscode-drnet').get('password')