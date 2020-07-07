import _Style from '../base/index';
import _Register from './register/register';
export default class Style extends _Style  {
    constructor() {
        super();

        this.add({
            header: {
                flex: 0,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                backgroundColor: '#9ea5ac',
                height: 50,
                marginTop: -40,
                marginLeft: -40,
                marginRight: 0
            },
            container: {
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                backgroundColor: '#c3cad1',
                paddingTop: 40,
                paddingLeft: 40,
                paddingRight: 0,
                paddingBottom: 40,
            },
            button: {
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'black',
                backgroundColor: '#4dbdea'
            },
            button_disabled: {
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'black'
            },
            text: {
                fontSize: 14,
                marginBottom: 8,
            },
            picker_container: {
                flex: 0,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                height: 50,
                marginTop: 0,
                marginLeft: 0,
                marginRight: -50
            },
            item: {
                width: 250,
                paddingBottom: 10,
                height: 80
            },
            button_text_round: {
                color: '#464d54',
                fontSize: 16,
                textAlign: 'center',
                width: 65
            },
            button_closed: {
                backgroundColor: 'red'
            },
            disabled: {
                backgroundColor: '#9f9fa6'
            }
        });

        this.add(new _Register());
    }
}