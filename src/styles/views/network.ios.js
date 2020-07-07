import _Style from '../base/index';
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
                marginTop: -60,
                marginLeft: -10,
                marginRight: -10
            },
            container: {
                flex: 2,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                backgroundColor: '#c3cad1',
                paddingTop: 60,
                paddingLeft: 10,
                paddingRight: 5,
                paddingBottom: 100,
            },
            child_container: {
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                backgroundColor: '#c3cad1',
                paddingTop: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingBottom: 200,
            },
            picker_container: {
                flex: 0,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                height: 50,
                marginTop: 0,
                marginLeft: -10,
                marginRight: -10
            },
            menu_container: {
                flex: 2,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'stretch',
                alignContent: 'center',
                backgroundColor: '#c3cad1'
            },
            open_search_container: {
                flex: 0,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                backgroundColor: '#c3cad1',
                paddingLeft: 10,
                paddingTop: 20,
                marginLeft:-90
            },
            button_container: {
                flex: 0,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                backgroundColor: '#c3cad1',
                paddingTop: 10,
                paddingLeft: 5,
                paddingRight: 5,
            },
            item: {
                width: 250,
                paddingBottom: 10,
                height: 80
            },
            button_text_round: {
                color: '#ffffff',
                fontSize: 16,
                textAlign: 'center',
                width: 65
            },
            button_closed: {
                backgroundColor: 'rgba(197,17,98,1)'
            },
            text: {
                fontSize: 14,
                marginBottom: 8,
            },
            button_disabled: {
                backgroundColor: '#9f9fa6'
            },
            button_selected: {
                backgroundColor: '#327a96'
            }
        });
    }
}