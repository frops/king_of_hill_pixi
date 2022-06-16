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
    GetChosenChar: function() {
        if (User.chars.length < 1) {
            return null;
        }

        for (let i = 0; i < User.chars.length; i++) {
            if (User.chars[i].is_chosen) {
                return User.chars[i];
            }
        }

        return null;
    }
}