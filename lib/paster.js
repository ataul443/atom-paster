'use babel'

import PasterView from './paster-view'
import { CompositeDisposable } from 'atom'
import PastebinApi from 'pastebin-js'


const url 				= 'https://pastebin.com/api/api_post.php'
var paste_result = ''

const api_dev_key = 'acfd1dbef54d781f37a108cd951bab5f'



export default {

	pasterView: null,
	modalPanel: null,
	subscriptions: null,

	activate(state) {
		this.pasterView = new PasterView(state.pasterViewState)
		this.modalPanel = atom.workspace.addModalPanel({
			item: this.pasterView.getElement(),
			visible: false
		})

		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.subscriptions = new CompositeDisposable()

		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'paster:paste': () => this.paste()
		}))
	},

	deactivate() {
		this.modalPanel.destroy()
		this.subscriptions.dispose()
		this.pasterView.destroy()
	},

	serialize() {
		return {
			pasterViewState: this.pasterView.serialize()
		}
	},

	paste() {
		console.log('Its running')
		let editor  = atom.workspace.getActiveTextEditor()
		var fileName = editor.getLongTitle()
		var temp = fileName.split(".")
		var ext = temp[1]
		console.log(fileName,temp,ext)
		let selection = editor.getSelectedText()
		this.pasteCreator(selection).then((data)=>{
			editor.insertNewlineBelow()
			var pastebinLink = `Pastebin Paste Link: ${data}`

			var comment = {
				py: `'''${pastebinLink}'''`,
				js: `/*${pastebinLink}*/`,
				html: `<!-- ${pastebinLink} -->`,
				css: `/*${pastebinLink}*/`,
				c: `/*${pastebinLink}*/`,
				cpp: `/*${pastebinLink}*/`,
				java: `/*${pastebinLink}*/`,
				php: `/*${pastebinLink}*/`,
				txt: `#${pastebinLink}`
			}
			var result = ''
			if(ext){
				result = comment[ext]
			}
			else{
				result = data
			}
			editor.insertText(result)
		}).catch((error)=>{
			atom.notifications.addWarning(error.reason)
		})



	},
	pasteCreator(selection){
		Pastebin = new PastebinApi({'api_dev_key' : api_dev_key,
                'api_user_name' : 'ataul443',
                'api_user_password' : 'ALw6fniD'})
		return new Promise((resolve, reject)=>{
			Pastebin.createPaste({
        text: selection,
        title: "Private",
        format: null,
        privacy: 3,
        expiration: '10M'
    })
				.then(function (data) {
					resolve(data)
				})
				.fail(function (err) {
					// Something went wrong
					console.log(err)
					reject({
						reason: err
					})


				})
		})


	}


}
