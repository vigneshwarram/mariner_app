import _Style from '../../base/index';
export default class Style extends _Style  {
    constructor() {
        super();

        this.add({
            button: {
                width: 150,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'black',
                backgroundColor: '#4dbdea'
            },
            button_disabled: {
                width: 150,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'black'
            },
            button_cancel: {
                width: 150,
                justifyContent: 'center',
                borderWidth: 1,
                backgroundColor: 'rgba(197,17,98,1)'
            },
            button_text: {
                color:'white'
            },
            submit_button: {
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'black',
                backgroundColor: '#4dbdea',
                flex:1,
                marginLeft:10,
                marginRight:10
            },
            exit_button: {
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'black',
                backgroundColor: 'rgba(197,17,98,1)',
                flex:1,
                marginLeft:10,
                marginRight:10
            },
            submit_button_disabled: {
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'black',
                flex:1,
                marginLeft:10,
                marginRight:10
            },
        })
    }
}