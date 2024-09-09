const FLAGS = ["white", "black", "gray"];

function judge(user_name, list){
    return FLAGS.find((flag) => {
        return list[flag].some((pattern) => {
            return pattern && user_name.match(pattern);
        });
    });
}

function add_flag_data(cells, list){
    Array.from(cells).forEach((cell) => {
        const user = cell.querySelector(".username").textContent;
        const userid = cell.querySelector(".username").href.split("/").pop()
        cell.dataset.user = user;
        cell.dataset.userid = userid;
        
        const flag = judge(user, list);
        if (flag)  cell.dataset.flag = flag;
        const idflag = judge(userid, list);
        if (idflag)  cell.dataset.idflag = idflag;
    });
}

function add_likes_data(cells){
    chrome.storage.local.get({
        likeSettings: [
            {like:50, color:"yellow"},
            {like:100, color:"red"},
            {like:200, color:"deeppink"},
        ]
    }, (settings) => {
        const sortedSetting = settings.likeSettings.concat()
        sortedSetting.sort((a,b) => {
            return a.like - b.like
        })
        sortedSetting.reverse()
        
        Array.from(cells).forEach((cell) => {
            const icon = cell.querySelector(".likes .icon");
            const likes = cell.querySelector(".likes").textContent.trim();
            cell.dataset.likes = likes;
            
            const target = icon;
            if(typeof target !== 'undefined'){
                if (likes >= sortedSetting[0].like){
                    target.style = "text-shadow: 0px 1px 2px white, 0px -1px 2px white;-webkit-text-stroke: 0.5px black;color:"+sortedSetting[0].color+";"
                } else if (likes >= sortedSetting[1].like){
                    target.style = "text-shadow: 0px 1px 2px white, 0px -1px 2px white;color:"+sortedSetting[1].color+";"
                } else if (likes >= sortedSetting[2].like){
                    target.style.color = sortedSetting[2].color
                }
            }
        })
    })
}

function rebuild_cells(cells){
    Array.from(cells).forEach((cell) => {
        if (cell.dataset.flag == "black" || cell.dataset.idflag == "black"){
            cell.remove();
        }
        
        if (cell.dataset.flag != "black" && cell.dataset.idflag != "black"){
            if (cell.dataset.flag) cell.classList.add(cell.dataset.flag);
            if (cell.dataset.idflag) cell.classList.add(cell.dataset.idflag);
        }
    })
}

const default_data = {
    white: "",
    black: "",
    gray: ""
};

chrome.storage.local.get(default_data, (saved) => {
    let list = {};
    
    FLAGS.forEach((flag) => {
        var text = saved[flag].trim();
        list[flag] = text.split(/\r*\n+/);
    });
    
    const rebuildstart = () => {
        const element = document.querySelector("#app > div.page.page-videoList > section > div > div.row");
        const mo = new MutationObserver((record, observer) => {
            const cells = document.querySelectorAll(".page-videoList__item");
            add_flag_data(cells, list);
            rebuild_cells(cells);
            add_likes_data(cells);
        });
        
        const config = {
            childList: true,
            subtree : true,
        };
        mo.observe(element, config);
    }

    const app_dom = document.querySelector("#app")
    const app_mo = new MutationObserver((record, observer) => {
        if(document.querySelector("#app > div.page.page-videoList > section > div > div.row") != null){
            rebuildstart();
            app_mo.disconnect();
        }
    });
    const app_config = {
        childList: true,
    };
    app_mo.observe(app_dom, app_config);
});
