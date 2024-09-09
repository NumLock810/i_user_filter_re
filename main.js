const FLAGS = ["white", "black", "gray"];

function judge(user_name, list){
    return FLAGS.find(function(flag){
        return list[flag].some(function(pattern){
            return pattern && user_name.match(pattern);
        });
    });
}

function add_flag_data(cells, list){
    Array.from(cells).forEach((cell) => {
        const user = cell.querySelector(".username").textContent;
        cell.dataset.user = user;
        
        const flag = judge(user, list);
        if (flag) cell.dataset.flag = flag;
    });
}

function add_likes_data(cells){
    Array.from(cells).forEach((cell) => {
        const icon = cell.querySelector(".right-icon");
        const likes = icon ? parseInt(icon.textContent) : 0;
        cell.dataset.likes = likes;
        
        if (likes >= 200){
            cell.classList.add("likes-over200");
        } else if (likes >= 100){
            cell.classList.add("likes-over100");
        } else if (likes >= 50){
            cell.classList.add("likes-over50");
        }
    });
}

function rebuild_cells(cells, rows){
    Array.from(rows).forEach((row) => {
        row.remove();
    })
    
    const row_count = 0, col_count = 0;
    let row;
    
    Array.from(cells).forEach((cell) => {
        if (col_count % 4 == 0) {
            row_count++;
            
            row = document.createElement("div");
            row.className = `views-row row views-row-${row_count}`;
            if(row_count == 1) row.classList.add("views-row-first");
            root.appendChild(row);
        }
        
        cell.remove();
        
        if (cell.dataset.flag != "black"){
            col_count++;
            
            var col = (col_count - 1) % 4;
            
            cell.className = `views-column col-sm-3 col-xs-6 views-column-${col + 1}`;
            if (cell.dataset.flag) cell.classList.add(cell.dataset.flag);
            
            if(col == 0) {
                cell.classList.add("views-row-first");
            } else if(col == 3) {
                cell.classList.add("views-row-last");
            }
            row.appendChild(cell);
        }
    })
    
    rows[rows.length - 1].classList.add("views-row-last");
    cells[cells.length - 1].classList.add("views-column-last");
}

const cells = document.querySelectorAll(".views-column");
const rows = document.querySelectorAll(".views-row");
const root = document.querySelector(".view-content");

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
    
    add_flag_data(cells, list);
    rebuild_cells(cells, rows);
    add_likes_data(cells); //rebuild_cellsで一旦クラスを全て消すからこれは下にする必要がある
});
