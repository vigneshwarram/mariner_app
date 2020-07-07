import _Style from '../base/index';
export default class Style extends _Style  {
    constructor() {
        super();

        this.add({
            container: {
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                backgroundColor: '#e9e9e9',
                paddingTop: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingBottom: 0,
            }
        })
    }
}