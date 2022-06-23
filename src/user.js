import { uniformParsers } from "pixi.js";
import * as helpers from "./helpers.js";

export let User = {
    isLoaded: false,
    isGuest: true,
    name: "",
    uuid: "",
    chars: [],
    jwt: "",
    LoadByJwt: function(jwtRaw) {
        let jwt = null;

        if (jwtRaw) {
            jwt = helpers.parseJwt(jwtRaw);
        }
    
        let isExpired = jwt && jwt.exp < parseInt(helpers.time() / 1000);

        if (!jwt || isExpired) {
            // this is guest
            return null;
        }

        User.isLoaded = true;
        User.uuid = jwt.uuid;
        User.name = jwt.name;
        User.isGuest = jwt.is_guest;
        User.jwt = jwtRaw;

        return User;
    },
    SetChars: function(chars) {
        if (chars && chars.length > 0) {
            User.chars = chars;
        }
    },
    IncrementExp: function(amount) {
        let chosenIndex = User.GetChosenCharIndex();

        if (chosenIndex === null) {
            return null;
        }

        User.chars[chosenIndex].exp += amount;
        User.chars[chosenIndex].remaining_exp -= amount;
        if (User.chars[chosenIndex].remaining_exp <= 0) {
            User.chars[chosenIndex].level++;
            User.chars[chosenIndex].remaining_exp=1000;//TODO change to get level from server
        }
    },
    GetChosenCharIndex: function() {
        if (User.chars.length < 1) {
            return null;
        }

        for (let i = 0; i < User.chars.length; i++) {
            if (User.chars[i].is_chosen) {
                return i;
            }
        }

        return null;
    },
    GetChosenChar: function() {
        let chosenIndex = User.GetChosenCharIndex();

        if (chosenIndex === null) {
            return null;
        }

        return User.chars[chosenIndex];
    }
}