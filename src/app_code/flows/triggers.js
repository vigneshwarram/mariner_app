/**
 * Class for allowing configurable triggers
 * The function must exist on the current view fto be triggered
 */
export default class Triggers {
    constructor(reference) {
        this.triggerReference = reference;
    }

    /**
     * Fire of a function call
     * @param name
     */
    fire(name) {
        try {
            let _function = this.triggerReference[name];
            if (typeof _function === "function")  {
                _function.apply(null, [this.triggerReference]);
            }
            else {
                alert("Trigger does not exist in the current flow '" + name + "()'. Please reconfigure switch.");
            }
        }
        catch(err) {
            alert("Trigger caused an error " + name); // message was removed here
        }
    }
}
