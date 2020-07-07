export default class ImageResources {

    constructor() {
        this.imageResources = [
            {name: "vt_brand", image:require('../../assets/blank.png')},
            {name: "vt_brand", image:require('../../assets/icon.png')}
        ];
    }

    /**
     * Load image resources
     * @param images
     */
    load(images) {
        this.imageResources = images;
    }

    /**
     * Merge resources
     * @param images
     */
    merge(images) {
        let _images = this.imageResources;
        this.imageResources = Object.assign({}, _images, images);
    }

    /**
     * Get an image resource
     * @param name
     */
    get(name) {
        if (name.indexOf('http') > -1 || name.indexOf('https') > -1) {
            return {uri: name};
        }
        else {
            let images = this.imageResources.filter(function(image){ return image.name === name; });
            if (images.length > 0) return images[0].image;
            else return this.imageResources[0].image;
        }
    }

}
