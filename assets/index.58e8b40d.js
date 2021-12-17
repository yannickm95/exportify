import { l as library, f as faSpotify, a as faCheckCircle, b as faBolt, c as faDownload, d as faSignOutAlt, e as faSort, g as faSortAmountUpAlt, j as jsxs, h as jsx, F as FontAwesomeIcon, B as Button, i as lib, k as axios, m as FileSaver_min, r as react, t as toast, T as ToastContainer, R as ReactDOM } from "./vendor.39f95637.js";
const p = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p();
library.add(faSpotify, faCheckCircle, faBolt, faDownload, faSignOutAlt, faSort, faSortAmountUpAlt);
var bootstrap_min = "";
var ReactToastify = "";
var index = "";
const fileName = (name) => name.replace(/[\x00-\x1F\x7F/\\<>:;"|=,.?*[\] ]+/g, "_").toLowerCase() + ".csv";
function getQueryParam(name) {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(window.location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function isArraySorted(array) {
  let sorted = true;
  for (let i = 0; i < array.length - 1; i++) {
    if (array[i] > array[i + 1]) {
      sorted = false;
      break;
    }
  }
  return sorted;
}
function isEven(value) {
  if (value % 2 === 0)
    return true;
  else
    return false;
}
function millisecondsToHuman(ms) {
  const seconds = Math.floor(ms / 1e3 % 60);
  const minutes = Math.floor(ms / 1e3 / 60);
  return minutes.toString() + ":" + seconds.toString().padStart(2, "0");
}
function sanitize(string) {
  return '"' + String(string).replace(/"/g, '""') + '"';
}
function Error() {
  return /* @__PURE__ */ jsxs("div", {
    id: "spotifyErrorMessage",
    className: "lead",
    children: [/* @__PURE__ */ jsx("p", {
      children: /* @__PURE__ */ jsx(FontAwesomeIcon, {
        icon: ["fas", "bolt"],
        style: {
          fontSize: "50px",
          marginBottom: "20px"
        }
      })
    }), /* @__PURE__ */ jsx("p", {
      children: "Oops, Exportify has encountered an unexpected error (5XX) while using the Spotify API. This kind of error is due to a problem on Spotify's side, and although it's rare, unfortunately all we can do is retry later."
    }), /* @__PURE__ */ jsxs("p", {
      style: {
        marginTop: "50px"
      },
      children: ["Keep an eye on the", " ", /* @__PURE__ */ jsx("a", {
        target: "_blank",
        rel: "noreferrer",
        href: "https://status.spotify.dev/",
        children: "Spotify Web API Status page"
      }), " ", "to see if there are any known problems right now, and then", " ", /* @__PURE__ */ jsx("a", {
        rel: "noreferrer",
        href: "?",
        children: "retry"
      }), "."]
    })]
  });
}
function Login() {
  return /* @__PURE__ */ jsxs("form", {
    className: "login-container",
    onSubmit: (event) => {
      event.preventDefault();
      authorize(event);
    },
    children: [/* @__PURE__ */ jsx("input", {
      id: "clientId",
      required: true,
      minLength: 32,
      maxLength: 32,
      type: "password",
      placeholder: "Enter client id..."
    }), /* @__PURE__ */ jsxs(Button, {
      type: "submit",
      variant: "outline-secondary",
      size: "lg",
      children: [/* @__PURE__ */ jsx(FontAwesomeIcon, {
        icon: ["far", "check-circle"],
        size: "sm"
      }), " Get Started"]
    })]
  });
}
function authorize(event) {
  const {
    clientId: {
      value: clientId
    }
  } = event.target.elements;
  const changeUser = getQueryParam("change_user") !== "";
  window.location.href = "https://accounts.spotify.com/authorize?client_id=" + clientId + "&redirect_uri=" + encodeURIComponent([window.location.protocol, "//", window.location.host, window.location.pathname].join("")) + "&scope=playlist-read-private%20playlist-read-collaborative%20user-library-read%20playlist-modify-private%20playlist-modify-public&response_type=token&show_dialog=" + changeUser;
}
function Logout() {
  const handleClick = () => {
    window.location.href = `${window.location.href.split("#")[0]}?change_user=true`;
  };
  return /* @__PURE__ */ jsx(Button, {
    id: "logoutButton",
    type: "submit",
    variant: "link",
    size: "lg",
    onClick: handleClick,
    title: "Change user",
    children: /* @__PURE__ */ jsx(FontAwesomeIcon, {
      icon: ["fas", "sign-out-alt"],
      size: "lg"
    })
  });
}
const REQUEST_RETRY_BUFFER = 1e3;
const MAX_RATE_LIMIT_RETRIES = 2;
const limiter = new lib({
  maxConcurrent: 1,
  minTime: 0
});
const apiCall = limiter.wrap(function(url, accessToken) {
  return axios.get(url, {
    headers: { Authorization: "Bearer " + accessToken }
  });
});
function apiCallErrorHandler(error) {
  if (error.isAxiosError) {
    if (error.request.status === 401) {
      window.location.href = window.location.href.split("#")[0];
      return;
    } else if (error.request.status >= 500 && error.request.status < 600) {
      window.location.href = `${window.location.href.split("#")[0]}?spotify_error=true`;
      return;
    }
  }
  throw error;
}
limiter.on("failed", async (error, jobInfo) => {
  if (error.response.status === 429 && jobInfo.retryCount < MAX_RATE_LIMIT_RETRIES) {
    return (error.response.headers["retry-after"] || 1) * 1e3 + REQUEST_RETRY_BUFFER;
  } else if (error.response.status !== 401 && error.response.status !== 429 && jobInfo.retryCount === 0) {
    return REQUEST_RETRY_BUFFER;
  }
});
const PLAYLIST_LIMIT = 20;
async function getPlaylists(accessToken, userId) {
  const loadSlice = async (start, end) => {
    const playlistsUrl = `https://api.spotify.com/v1/users/${userId}/playlists?offset=${start}&limit=${end - start}`;
    const playlistsResponse = await apiCall(playlistsUrl, accessToken);
    return playlistsResponse.data;
  };
  const { items, total } = await loadSlice(0, PLAYLIST_LIMIT);
  let playlists = items;
  for (let offset = PLAYLIST_LIMIT; offset < total; offset = offset + PLAYLIST_LIMIT) {
    const { items: items2 } = await loadSlice(offset, offset + PLAYLIST_LIMIT);
    playlists = [...playlists, ...items2];
  }
  return playlists;
}
async function getPlaylistTracks(accessToken, playlist) {
  const requests = [];
  const limit = playlist.tracks.limit || 100;
  for (let offset = 0; offset < playlist.tracks.total; offset = offset + limit) {
    requests.push(`${playlist.tracks.href.split("?")[0]}?offset=${offset}&limit=${limit}`);
  }
  const trackPromises = requests.map((request) => {
    return apiCall(request, accessToken);
  });
  const trackResponses = await Promise.all(trackPromises);
  return trackResponses.flatMap((response) => {
    return response.data.items.filter((i) => i.track);
  });
}
function formatCompareValue(track) {
  const trackNumber = track.track_number.toString().padStart(2, "0");
  const artist = sanitizeData(track.artists[0].name);
  const albumName = sanitizeData(track.album.name);
  const releaseDate = track.album.release_date === null ? "0000-00-00" : track.album.release_date;
  return artist + releaseDate + albumName + trackNumber;
}
function sanitizeData(value) {
  let returnValue = value;
  if (value.toLowerCase().startsWith("a ")) {
    returnValue = value.substring(2);
  } else if (value.toLowerCase().startsWith("the ")) {
    returnValue = value.substring(4);
  } else if (value.startsWith("$")) {
    returnValue = value.replace("$", "S");
  }
  return returnValue.toLowerCase();
}
async function quickSortPlaylist(accessToken, playlist) {
  async function quickSort(arrayToSort, low, high) {
    const instanceArray = [...arrayToSort];
    const index2 = await partition(instanceArray, low, high);
    if (low < index2 - 1) {
      await quickSort(instanceArray, low, index2 - 1);
    }
    if (index2 < high) {
      await quickSort(instanceArray, index2, high);
    }
  }
  async function partition(arrayToSort, low, high) {
    const pivot = arrayToSort[Math.floor((low + high) / 2)];
    while (low <= high) {
      while (arrayToSort[low] < pivot) {
        low++;
      }
      while (arrayToSort[high] > pivot) {
        high--;
      }
      if (low <= high) {
        await swap(arrayToSort, low, high);
        low++;
        high--;
      }
    }
    return low;
  }
  async function swap(arrayToSort, low, high) {
    const lowValue = arrayToSort[low];
    arrayToSort[low] = arrayToSort[high];
    arrayToSort[high] = lowValue;
    await axios.put(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      range_start: low,
      insert_before: high + 1
    }, {
      headers: { Authorization: "Bearer " + accessToken }
    });
    await axios.put(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      range_start: high - 1 > 0 ? high - 1 : 0,
      insert_before: low
    }, {
      headers: { Authorization: "Bearer " + accessToken }
    });
  }
  const tracks = await getPlaylistTracks(accessToken, playlist).then((data) => data.map(({ track }) => formatCompareValue(track)));
  if (!isArraySorted(tracks)) {
    await quickSort(tracks, 0, tracks.length - 1);
    return "sorted";
  } else {
    return "is-sorted";
  }
}
async function lastSort(accessToken, playlist) {
  const tracks = await getPlaylistTracks(accessToken, playlist).then((data) => data.map(({ track }) => formatCompareValue(track)));
  const newItems = [];
  for (let index2 = tracks.length - 1; index2 > 0; index2--) {
    const item = tracks[index2];
    if (tracks.slice(index2 - 100 > 0 ? index2 - 100 : 0, index2).some((prevItem) => item < prevItem)) {
      newItems.push(item);
    } else {
      break;
    }
  }
  if (newItems.length === 0)
    return 0;
  for (const item of newItems) {
    const newIndex = tracks.findIndex((t) => t > item);
    await axios.put(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      range_start: tracks.length - 1,
      insert_before: newIndex
    }, {
      headers: { Authorization: "Bearer " + accessToken }
    });
    tracks.splice(newIndex, 0, item);
    tracks.splice(-1, 1);
  }
  return newItems.length;
}
function convertTracksToCsv(tracks) {
  const lines = [
    [
      "Track URI",
      "Track Name",
      "Artist Name(s)",
      "Album Name",
      "Album Artist Name(s)",
      "Album Release Date",
      "Album Image URL",
      "Album URI",
      "Disc Number",
      "Track Number",
      "Track Duration (ms)"
    ],
    ...formatTracksForCsv(tracks).filter((track) => track.uri).map((track) => track.item)
  ];
  return lines.map((line) => line.map(sanitize).join(",") + "\n").join("");
}
function formatTracksForCsv(items) {
  return items.map(({ track }) => ({
    uri: track.uri,
    item: [
      track.uri.startsWith("spotify:local") ? decodeURIComponent(track.uri.replaceAll("+", " ")) : track.uri,
      track.name,
      track.artists.map((a) => String(a.name).replace(/,/g, "\\,")).join(", "),
      track.album.name,
      track.album.artists.map((a) => String(a.name).replace(/,/g, "\\,")).join(", "),
      track.album.release_date == null ? "" : track.album.release_date,
      track.album.images[0] == null ? "" : track.album.images[0].url,
      track.album.uri == null ? "" : track.album.uri,
      track.disc_number,
      track.track_number,
      millisecondsToHuman(track.duration_ms)
    ]
  }));
}
async function exportToCsv(accessToken, playlist) {
  const items = await getPlaylistTracks(accessToken, playlist);
  const blob = new Blob([convertTracksToCsv(items)], {
    type: "text/csv;charset=utf-8"
  });
  FileSaver_min.exports.saveAs(blob, fileName(playlist.name));
}
function ButtonLoader() {
  return /* @__PURE__ */ jsx("div", {
    className: "loader",
    children: /* @__PURE__ */ jsx("div", {
      className: "loader__content"
    })
  });
}
const IGNORE_LIST = ("" == null ? void 0 : "".replaceAll("_", " ").split(",")) || [];
function PlaylistRow({
  playlist,
  accessToken,
  index: index2
}) {
  var _a;
  const [isQuickSorting, setIsQuickSorting] = react.exports.useState(false);
  const sortPlaylistWithQuick = () => {
    setIsQuickSorting(true);
    quickSortPlaylist(accessToken, playlist).then((sorted) => toast.success(sorted !== "is-sorted" ? `Sorted all items!` : "Playlist already sorted!", {
      position: "bottom-right",
      autoClose: 3e3,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: void 0
    })).catch(apiCallErrorHandler).finally(() => setIsQuickSorting(false));
  };
  const [isLastSorting, setIsLastSorting] = react.exports.useState(false);
  const sortPlaylistWithLast = () => {
    setIsLastSorting(true);
    lastSort(accessToken, playlist).then((sorted) => toast.success(sorted ? `Sorted ${sorted} items!` : "Playlist already sorted!", {
      position: "bottom-right",
      autoClose: 3e3,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: void 0
    })).catch(apiCallErrorHandler).finally(() => setIsLastSorting(false));
  };
  const [isExporting, setIsExporting] = react.exports.useState(false);
  const exportPlaylist = () => {
    setIsExporting(true);
    exportToCsv(accessToken, playlist).catch(apiCallErrorHandler).finally(() => setIsExporting(false));
  };
  const disabled = isExporting || isQuickSorting || isLastSorting;
  if (playlist.uri == null) {
    return /* @__PURE__ */ jsxs("tr", {
      className: !isEven(index2) ? "alt-color" : "",
      children: [/* @__PURE__ */ jsx("td", {
        children: "\xA0"
      }), /* @__PURE__ */ jsx("td", {
        children: playlist.name
      }), /* @__PURE__ */ jsx("td", {
        colSpan: 2,
        children: "This playlist is not supported"
      }), /* @__PURE__ */ jsx("td", {
        children: "\xA0"
      }), /* @__PURE__ */ jsx("td", {
        children: "\xA0"
      })]
    }, playlist.name);
  }
  return /* @__PURE__ */ jsxs("tr", {
    className: !isEven(index2) ? "alt-color" : "",
    children: [/* @__PURE__ */ jsx("td", {
      children: /* @__PURE__ */ jsx("img", {
        alt: "cover",
        src: (_a = playlist == null ? void 0 : playlist.images) == null ? void 0 : _a[0].url
      })
    }), /* @__PURE__ */ jsx("td", {
      className: "align-middle",
      children: /* @__PURE__ */ jsx("a", {
        href: playlist.uri,
        children: playlist.name
      })
    }), /* @__PURE__ */ jsx("td", {
      className: "align-middle",
      children: playlist.tracks.total
    }), /* @__PURE__ */ jsx("td", {
      className: "text-center align-middle",
      children: !IGNORE_LIST.includes(playlist.name) ? /* @__PURE__ */ jsxs(Button, {
        type: "submit",
        variant: "primary",
        onClick: sortPlaylistWithQuick,
        className: "text-nowrap text-center button-flex",
        disabled,
        children: [isQuickSorting ? /* @__PURE__ */ jsx(ButtonLoader, {}) : /* @__PURE__ */ jsx(FontAwesomeIcon, {
          icon: ["fas", "sort"],
          size: "sm"
        }), " ", "Quicksort"]
      }) : null
    }), /* @__PURE__ */ jsx("td", {
      className: "text-center align-middle",
      children: !IGNORE_LIST.includes(playlist.name) ? /* @__PURE__ */ jsxs(Button, {
        type: "submit",
        variant: "primary",
        onClick: sortPlaylistWithLast,
        className: "text-nowrap text-center button-flex",
        disabled,
        children: [isLastSorting ? /* @__PURE__ */ jsx(ButtonLoader, {}) : /* @__PURE__ */ jsx(FontAwesomeIcon, {
          icon: ["fas", "sort-amount-up-alt"],
          size: "sm"
        }), " ", "Sort Last"]
      }) : null
    }), /* @__PURE__ */ jsx("td", {
      className: "text-center align-middle",
      children: /* @__PURE__ */ jsxs(Button, {
        type: "submit",
        variant: "primary",
        onClick: exportPlaylist,
        className: "text-nowrap text-center button-flex",
        disabled,
        children: [isExporting ? /* @__PURE__ */ jsx(ButtonLoader, {}) : /* @__PURE__ */ jsx(FontAwesomeIcon, {
          icon: ["fas", "download"],
          size: "sm"
        }), " ", "Export"]
      })
    })]
  }, playlist.uri);
}
function PlaylistTable({
  accessToken
}) {
  const [playlists, setPlaylists] = react.exports.useState(void 0);
  react.exports.useEffect(() => {
    (async function() {
      try {
        const {
          data: user
        } = await apiCall("https://api.spotify.com/v1/me", accessToken);
        const playlists2 = await getPlaylists(accessToken, user.id);
        const subtitleEl = document.getElementById("subtitle");
        setPlaylists(playlists2);
        subtitleEl.textContent = `${playlists2.length} playlists for ${user.id}`;
      } catch (error) {
        apiCallErrorHandler(error);
      }
    })();
  }, [accessToken]);
  if (!playlists) {
    return /* @__PURE__ */ jsx("div", {
      className: "spinner"
    });
  }
  return /* @__PURE__ */ jsx("div", {
    id: "playlists",
    children: /* @__PURE__ */ jsxs("table", {
      className: "table table-hover table-sm",
      children: [/* @__PURE__ */ jsx("thead", {
        children: /* @__PURE__ */ jsxs("tr", {
          children: [/* @__PURE__ */ jsx("th", {
            style: {
              width: "100px"
            }
          }), /* @__PURE__ */ jsx("th", {
            children: "Name"
          }), /* @__PURE__ */ jsx("th", {
            children: "Tracks"
          }), /* @__PURE__ */ jsx("th", {
            style: {
              width: "130px"
            }
          }), /* @__PURE__ */ jsx("th", {
            style: {
              width: "130px"
            }
          }), /* @__PURE__ */ jsx("th", {
            style: {
              width: "130px",
              textAlign: "right",
              paddingRight: "15px"
            },
            children: "Actions"
          })]
        })
      }), /* @__PURE__ */ jsx("tbody", {
        children: playlists.map((playlist, index2) => /* @__PURE__ */ jsx(PlaylistRow, {
          playlist,
          index: index2,
          accessToken
        }, playlist.id))
      })]
    })
  });
}
function Template({
  children,
  logoutElement = null
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "App container",
    children: [/* @__PURE__ */ jsxs("header", {
      className: "App-header",
      children: [logoutElement, /* @__PURE__ */ jsxs("h1", {
        children: [/* @__PURE__ */ jsx(FontAwesomeIcon, {
          icon: ["fab", "spotify"],
          color: "#1ed760",
          size: "sm"
        }), " ", "Hatlaron's Exportify"]
      }), /* @__PURE__ */ jsx("p", {
        id: "subtitle",
        className: "lead text-secondary",
        children: "Export and sort your Spotify playlists."
      })]
    }), children, /* @__PURE__ */ jsx(ToastContainer, {
      theme: "dark"
    })]
  });
}
function App() {
  const key = new URLSearchParams(window.location.hash.substring(1));
  if (getQueryParam("spotify_error") !== "") {
    return /* @__PURE__ */ jsx(Template, {
      children: /* @__PURE__ */ jsx(Error, {})
    });
  }
  if (!key.has("access_token")) {
    return /* @__PURE__ */ jsx(Template, {
      children: /* @__PURE__ */ jsx(Login, {})
    });
  }
  return /* @__PURE__ */ jsx(Template, {
    logoutElement: /* @__PURE__ */ jsx(Logout, {}),
    children: /* @__PURE__ */ jsx(PlaylistTable, {
      accessToken: key.get("access_token")
    })
  });
}
ReactDOM.render(/* @__PURE__ */ jsx(react.exports.StrictMode, {
  children: /* @__PURE__ */ jsx(App, {})
}), document.getElementById("root"));
