import _Style from '../base/index';
export default class Style extends _Style  {
    constructor() {
        super();

        this.add({
            container: {
                flex: 1
            },
            preview: {
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center'
            },
            centerIcon: {
                flex: 1,
                alignItems: 'center'
            }
        })
    }
}