import _Style from '../base/index';
export default class Style extends _Style  {
    constructor() {
        super();

        this.add({
            container: {
                paddingTop: 20,
                flex: 1
            },
            navItemStyle: {
                padding: 10
            },
            navSectionStyle: {
            },
            sectionHeadingStyle: {
                paddingVertical: 10,
                paddingHorizontal: 5
            },
            footerContainer: {
            },
            side_menu_item_style: {
                flex: 0,
                flexDirection: 'row',
                paddingBottom: 20,
                borderBottomColor: '#3d3d3d',
                borderBottomWidth: 1
            },
            fa_style: {
                color: '#0aa5ff',
                flex: 0,
                marginTop: 10,
                paddingLeft: 30,
                paddingRight: 20
            }
        })
    }
}