--adding the source directory to the package path and loading the module
package.path = mp.command_native( {"expand-path", (mp.get_opt("scroll_list-directory") or "~~/scripts") } ) .. "/?.lua;" .. package.path
local list = require "scroll-list"

--modifying the list settings
list.header = "Playlist"

--jump to the selected video
local function open_video()
    if list.list[list.selected] then
        mp.set_property_number('playlist-pos', list.selected - 1)
    end
end

--dynamic keybinds to bind when the list is open
list.keybinds = {
    {'j', 'scroll_down', function() list:scroll_down() end, {repeatable = true}},
    {'k', 'scroll_up', function() list:scroll_up() end, {repeatable = true}},
    {'l', 'open_chapter', open_video, {} },
    {'q', 'close_browser', function() list:close() end, {}}
}

function os.capture(cmd, raw)
  local f = assert(io.popen(cmd, 'r'))
  local s = assert(f:read('*a'))
  f:close()
  if raw then return s end
  s = string.gsub(s, '^%s+', '')
  s = string.gsub(s, '%s+$', '')
  s = string.gsub(s, '[\n\r]+', ' ')
  return s
end

function observe_change(_, current)
    list.list = {}
    local playlist_length = mp.get_property_number('playlist-count', 0)
    if playlist_length < 2 then return end

    local playlist_current = mp.get_property_number('playlist-pos', 0)

    for i = 1, playlist_length do
        local item = {}
        local str = i .. '. '
        local index = i - 1

        if (index == playlist_current) then
          item.style = [[{\c&H33ff66&}]]
        end

        local filename = mp.get_property('playlist/'..index..'/filename')
        local name = filename

        -- unable to retrieve video names without some sort of async call mechanism
        -- for each video in the playlist (aka not worth my time)

        -- local range = 3
        -- if ((index >= playlist_current - 3) or (index <= playlist_current + 3)) then
        --     local titlecmd = "youtube-dl --no-playlist --get-title " .. filename
        --     local title = os.capture(titlecmd)

        --     if title then
        --         name = title
        --     end
        -- end

        str = str .. name

        item.ass = list.ass_escape(str)
        list.list[i] = item
    end
    list:update()
end

mp.observe_property('playlist-count', 'number', observe_change)
mp.observe_property('playlist-pos', 'number', observe_change)
mp.observe_property('playlist-pos-1', 'number', observe_change)

mp.add_key_binding("p", "toggle-playlist-browser", function() list:toggle() end)
