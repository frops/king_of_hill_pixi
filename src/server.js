export let Server = {
    time: null,
    token: "",
    version: "",
    isLoaded: false,
    backendURL: "",
    centrifugoHost: "",
    setKingFromWs: null,
    init: function (BackendURL, CentrifugoHost, setKingFromWs) {
        Server.backendURL = BackendURL;
        Server.centrifugoHost = CentrifugoHost;
        Server.setKingFromWs = setKingFromWs;
    },
    load: function () {
        axios.get(Server.backendURL + '/v1/info')
            .then(function (response) {
                let raw = response.data.data;
                Server.time = new Date(raw.time).getTime();
                Server.token = raw.token;
                Server.version = raw.version;
                Server.isLoaded = true;
                Server.wsInit();
                console.log('SERVER INFO loaded');
            }).catch(function (error) {
                console.error(error);
            });
    },
    info: function(success, error) {
        axios.request({url: Server.backendURL + '/v1/game/info',  withCredentials: true})
        .then(function (response) {
            success(response.data.data);
        }).catch(function (err) {
            error(err);
        });
    },
    click: function(user, success, error) {
        axios.request({
            url: Server.backendURL + '/v1/game/click',
            method: 'post',
            headers: { "Authorization": "Bearer " + user.jwt },
            withCredentials: true,
        }).then(function (response) {
            success(response);
        }).catch(function (err) {
            error(err);
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
            console.log("connected", ctx);
        });

        centrifuge.on('disconnect', function (ctx) {
            console.log("disconnected", ctx);
        });

        centrifuge.subscribe("hill_click", function (ctx) {
            console.log(ctx.data, "hill_click_ws");
            Server.setKingFromWs(ctx.data);
        });

        centrifuge.connect();
    }
};