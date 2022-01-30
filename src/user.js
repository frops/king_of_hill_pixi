import * as helpers from "./helpers.js";

export let User = {
    isLoaded: false,
    isGuest: true,
    name: "",
    uuid: "",
    jwt: "",
    loadByJwt: function(jwtRaw) {
        let jwt = null;

        if (jwtRaw) {
            jwt = helpers.parseJwt(jwtRaw);
        }
    
        let isExpired = jwt && jwt.exp < parseInt(helpers.time() / 1000);

        if (!jwt || isExpired) {
            // this is guest
            return null;
        }

        console.log(jwt, "jwt is");

        User.isLoaded = true;
        User.uuid = jwt.uuid;
        User.name = jwt.name;
        User.isGuest = jwt.is_guest;
        User.jwt = jwtRaw;

        return User;
    }
}