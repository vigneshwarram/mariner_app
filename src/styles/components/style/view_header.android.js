import _Style from '../../base/index';
export default class Style extends _Style  {
    constructor() {
        super();

        this.add({
            header_icon: {
                color: '#ffffff',
                fontSize: 35,
                textAlign: 'center'
            }
        })
    }
}