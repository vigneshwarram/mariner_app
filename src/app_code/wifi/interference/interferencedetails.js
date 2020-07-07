import React from "react";

export default class InterferenceDetails extends React.Component{

    constructor() {
        super();

        this._coScore = null;
        this._adjScore = null;
        this._combinedScore = null;
    }

    setInterference(value) {
        this._coScore = value.coScore;
        this._adjScore = value.adjScore;
        this._combinedScore = value.combinedScore;
    }

    set interference(value) {
        this._coScore = value.coScore;
        this._adjScore = value.adjScore;
        this._combinedScore = value.combinedScore;
    }
    get interference() {
        return {coScore: this._coScore, adjScore: this._adjScore, combinedScore: this._combinedScore};
    }
    set coScore(value) {
        this._coScore = value;
    }
    get coScore() {
        return this._coScore;
    }
    set adjScore(value) {
        this._adjScore = value;
    }
    get adjScore() {
        return this._adjScore;
    }
    set combinedScore(value) {
        this._combinedScore = value;
    }
    get combinedScore() {
        return this._combinedScore;
    }
}
