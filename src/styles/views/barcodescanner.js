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
            overlay: {
                position: 'absolute',
                padding: 16,
                right: 0,
                left: 0,
                alignItems: 'center'
            },
            topOverlay: {
                top: 0,
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            },
            bottomOverlay: {
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
            },
            scanScreenMessage: {
                fontSize: 14,
                color: 'white',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center'
            }
        })
    }
}