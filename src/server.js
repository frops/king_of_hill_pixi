export let Server = {
    events: {},
    time: null,
    token: "",
    version: "",
    noKing: "",
    isLoaded: false,
    mainURL: "",
    domain: "",
    backendURL: "",
    centrifugoHost: "",
    setKingFromWs: null,
    googleCallback: null,
    init: function (MainURL, Domain, BackendURL, CentrifugoHost, setKingFromWs) {
        Server.mainURL = MainURL;
        Server.domain = Domain;
        Server.backendURL = BackendURL;
        Server.centrifugoHost = CentrifugoHost;
        Server.setKingFromWs = setKingFromWs;

        return Server;
    },
    load: function (callback) {
        // Get main info/settings from server
        axios.get(Server.backendURL + '/v1/info')
            .then(function (response) {
                let raw = response.data.data;
                Server.time = new Date(raw.time).getTime();
                Server.token = raw.token;
                Server.version = raw.version;
                Server.noKing = raw.no_king;
                Server.isLoaded = true;
                Server.wsInit();
                Server.initGoogleCallback();

                callback(Server);
            }).catch(function (error) {
                console.error(error, 'server info');
            });
    },

    // Get user info
    info: function(user, success, error) {
        axios.request({
            url: Server.backendURL + '/v1/game/info',
            headers: { "Authorization": "Bearer " + user.jwt },
            withCredentials: true,
        })
        .then(function (response) {
            success(response.data.data);
        }).catch(function (err) {
            console.error(err);
        });
    },

    // Get choose chars of user
    getChooseChars: function(user, success) {
        axios.request({
            url: Server.backendURL + '/v1/chars/choose',
            headers: { "Authorization": "Bearer " + user.jwt },
            withCredentials: true,
        })
        .then(function (response) {
            success(response.data.data);
        }).catch(function (err) {
            console.error(err);
        });
    },

    // Click request to server
    chooseChar: function(user, uuid, success, error) {
        axios.request({
            url: Server.backendURL + '/v1/chars/choose',
            method: 'post',
            headers: {"Authorization": "Bearer " + user.jwt },
            withCredentials: true,
            data: 'uuid=' + uuid, 
        }).then(function (response) {
            success(response);
        }).catch(function (err) {
            console.error(err);
        });
    },

    // Click request to server
    click: function(user, success, error) {
        axios.request({
            url: Server.backendURL + '/v1/game/click',
            method: 'post',
            headers: {"Authorization": "Bearer " + user.jwt },
            withCredentials: true,
        }).then(function (response) {
            success(response);
        }).catch(function (err) {
            error(err);
        });
    },
    authGoogleUser: function(code, scope, success) {        
        axios.get(Server.backendURL + `/v1/auth/google?code=${code}&scope=${scope}`)
        .then(function (resp) {
            success(resp.data.data.token);
        })
        .catch(function (err) {
            console.error(err);
        });
    },
    createGuest: function (success, error) {
        try {
            return axios.request({
                url: Server.backendURL + '/v1/user/guest',
                method: 'post',
                withCredentials: true,
            }).then(function (response) {
                success(response.data.data.token);
            });
        } catch (err) {
            error(err);
        }
    },
    wsInit: function () {
        let centrifuge = new Centrifuge(Server.centrifugoHost + "/connection/websocket", {
            debug: true
        });
        centrifuge.setToken(Server.token);

        centrifuge.on('connect', function (ctx) {
            console.debug("connected", ctx);
        });

        centrifuge.on('disconnect', function (ctx) {
            console.log("disconnected", ctx);
        });

        centrifuge.subscribe("hill_click", function (ctx) {
            Server.setKingFromWs(ctx.data);
        });

        centrifuge.subscribe("start_contest", function (ctx) {
            document.dispatchEvent(new CustomEvent('start_contest', {detail: ctx}));
        });

        centrifuge.subscribe("start_king_time", function (ctx) {
            document.dispatchEvent(new CustomEvent('start_king_time', {detail: ctx}));
        });

        centrifuge.connect();
    },

    initGoogleCallback: function() {
        // Check Google callback
        Server.googleCallback = {
            code: null,
            scope: null,
            init: function() {
                let url = new URL(window.location.href);
                Server.googleCallback.code = url.searchParams.get("code");
                Server.googleCallback.scope = url.searchParams.get("scope");
            },
            isNeedRequest: function() {
                return Server.googleCallback.code != null && Server.googleCallback.scope != null;
            }
        };
    },

    //Auth
    getGoogleLink: function() {
        let scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
        let clientId = '420026011536-opg41dihbickgolvjvjbqc6bjsutekat.apps.googleusercontent.com';
        let redirectUri = encodeURIComponent(Server.mainURL);//encodeURIComponent('https://bakla.games/auth/google/callback');
        let state = makeid(16);
        let authURL = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${redirectUri}` + 
        `&prompt=consent&state=${state}&response_type=code&client_id=${clientId}&scope=${scope}&access_type=offline`;

        window.location.href = authURL;
    }
};

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}