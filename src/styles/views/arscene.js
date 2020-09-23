import _Style from '../base/index';
export default class Style extends _Style  {
    constructor() {
        super();

        this.add({
            card: {
                flexDirection: 'column',
                alignItems: 'center'
            },
            cardHeader: {
                flexDirection: 'column',
                flex: 0.7,
                alignItems: 'flex-start',
                marginLeft: 10
            },
            cardWrapper: {
                flexDirection: 'row',
                flex: .5,
                alignItems: 'flex-start',
                marginLeft: 10
            },
            cardBorder: {
                flexDirection: 'column',
                padding: 0.001
            },
            signalStyle_Excellent: {
                color: '#68ff5b'
            },
            signalStyle_Green: {
                color: '#68ff5b'
            },
            signalStyle_Yellow: {
                color: '#fff33e'
            },
            signalStyle_Red: {
                color: '#ff2a21'
            },
            signalStyle_Blue: {
                color: '#4dbdea'
            },
            textStyle: {
                flex: .2,
                paddingLeft: .6,
                fontFamily: 'Roboto',
                fontSize: 32,
                color: '#000000',
                textAlignVertical: 'top',
                textAlign: 'center',
                fontWeight: '200'
            },
            textSSID: {
                flex: .2,
                paddingLeft: 3,
                marginLeft: .8,
                fontFamily: 'Times',
                fontSize: 9,
                color: '#000000',
                textAlignVertical: 'top',
                textAlign: 'left',
                fontWeight: '800'
            },
            textBSSID: {
                flex: .2,
                paddingLeft: .3,
                fontFamily: 'Times',
                fontSize: 9,
                color: '#000000',
                textAlignVertical: 'top',
                textAlign: 'left',
                fontWeight: '800'
            },
            textStyleImage: {
                marginLeft: .5,
                flex: 0,
                alignItems:'center',
                justifyContent:'center',
            },
        })
    }
}
