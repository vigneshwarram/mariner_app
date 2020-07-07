/**
 * Global theme style
 */
export const style = {
    brandIcon: require('../../../assets/icon.png'),
    brandLogo: require('../../../assets/logo.png'),
    globalHeaderLogo: require('../../../assets/logo.png'),
    globalHeader: {
        backgroundColor: '#225E9C',
        borderBottomColor: '#ffffff',
        borderBottomWidth: 0,
    },
    globalHeaderMenu: {
        color: "#ffffff"
    },
    h1: {
        fontFamily: Platform.OS  === 'ios' ? 'Verdana' : 'sans-serif-condensed',
        fontSize: 24,
        fontWeight: 'bold'
    },
    h2: {
        fontFamily: Platform.OS  === 'ios' ? 'Verdana' : 'sans-serif-condensed',
        fontSize: 20,
        fontWeight: 'bold'
    },
    h6: {
        fontFamily: Platform.OS  === 'ios' ? 'Verdana' : 'sans-serif-condensed',
        fontSize: 16
    },

    header: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#9ea5ac',
        height: 80,
        marginTop: -40,
        marginLeft: -40,
        marginRight: -40
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#ffffff',
        paddingTop: 40,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 40,
    },
    input: {
        backgroundColor: '#e9e9e9',
        paddingLeft: 5,
        borderRadius: 4,
        height: 50,
        borderWidth: 1,
        borderColor: 'black'

    },
    picker: {
        backgroundColor: '#e9e9e9',
        borderWidth: 1,
        borderColor: 'black'
    },
    input_disabled: {
        color: 'grey'
    },
    card: {
        backgroundColor: '#c3cad1',
        borderRadius: 4,
        borderWidth: 0,
        borderColor: '#c3cad1'
    },
    form_top: {
        paddingTop: 20
    },
    button_container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#c3cad1',
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
    button: {
        padding: 5,
        backgroundColor: '#225E9C',
        color: '#ffffff',
        borderRadius: 50,
    },
    button_text: {
        color: '#ffffff',
        fontSize: 16,
    },
    text: {
        fontSize: 20,
        textAlign: 'left',
        margin: 0,
    },
    item: {
        paddingBottom: 10,
        height: 80
    },
    circle_button: {
        backgroundColor: '#225E9C',
        textAlign: 'center',
        width: 65,
        height: 65,
        paddingTop: 5,
        marginTop: 15,
        marginBottom: 60,
        marginLeft: 10,
        shadowColor: "rgba(0,0,0,1)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 2,
        elevation: 10,
        shadowOpacity: 0.5,
    },
    icon_button: {
        backgroundColor: '#225E9C',
        textAlign: 'center',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
        paddingTop: 5,
        marginTop: 15,
        marginBottom: 60,
        marginLeft: 10,
        shadowColor: "rgba(0,0,0,1)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 2,
        elevation: 10,
        shadowOpacity: 0.5,
    },
    test_icon_button: {
        backgroundColor: '#225E9C',
        textAlign: 'center',
        alignItems: 'flex-start',
        alignContent: 'center',
        justifyContent: 'center',
        width: 100,
        height: 100,
        paddingTop: 5,
        marginTop: 15,
        marginBottom: 60,
        marginLeft: 10,
        shadowColor: "rgba(0,0,0,1)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 2,
        elevation: 10,
        shadowOpacity: 0.5,
    },
    button_icon: {
        color: '#ffffff',
        fontSize: 60,
        textAlign: 'center',
        marginTop: 12
    },
    button_icon_fa: {
        color: '#ffffff',
        fontSize: 45,
        textAlign: 'center'
    },
    round_button: {
        margin: 15,
        marginTop: 50,
        borderRadius: 100,
        shadowColor: "rgba(0,0,0,1)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 2,
        elevation: 10,
        shadowOpacity: 0.5
    },
    text_area: {
        backgroundColor: '#e9e9e9',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'black'

    },
    label_value_outline: {
        textShadowColor: '#000000',
        textShadowOffset: {width: 1, height: 0.5},
        textShadowRadius: 0.5
    },
    arView: {
        flex:1
    },
    side_container: {
        paddingTop: 20,
        flex: 1
    },
    side_icon: {
        color: "#225E9C"
    },
    side_label: {
        fontFamily: Platform.OS  === 'ios' ? 'Verdana' : 'sans-serif-condensed',
        color: '#225E9C',
        fontSize: 16
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
        color: '#225E9C',
        flex: 0,
        marginTop: 10,
        paddingLeft: 30,
        paddingRight: 20
    },
    callout: {
        backgroundColor: "#253C78",
        color: "#FFFFFF"
    },
};
