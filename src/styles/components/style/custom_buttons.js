import _Style from '../../base/index';
export default class Style extends _Style  {
    constructor() {
        super();

        this.add({
            button: {
                width: 150,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#4dbdea',
            },
            button_text: {
                textTransform: 'capitalize',
                color:'#4dbdea'
            },
        })
    }
}
