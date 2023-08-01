var dataLayout = []

dataLayout['menu_main_loading'] = `
<div>
    <div class="menu_main_start">
        <text class="menu_main_start_text">Game Loading...</text>
    </div>
</div>`

dataLayout['menu_main'] = `
<div>
    <div class="menu_main_background">
        <img src="./data/background/menu.webp" alt="background_menu"></img>
    </div>
    <div class="menu_main_title">
        <div class="menu_main_title_box">
        </div>
    </div>
    <div class="menu_main_start">
        <text class="menu_main_start_text">Play Now</text>
    </div>
</div>`

dataLayout['game_tiles'] = `
<div>
    <div class="game_tiles_background">
        <img src="./data/background/gameplay.webp" alt="background_gameplay"></img>
    </div>
    <div class="game_tiles_score">
        <text class="game_tiles_score_text" id="game_tiles_score">Score: 0</text>
    </div>
    <div class="game_tiles_body">
    </div>
</div>`

export {dataLayout}