/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var idbApp = (function() {
  'use strict';

  if (!('indexedDB' in window)) {
    console.log('This browser does not support IndexedDB');
    return;
  }

  const dbPromise = idb.open('player-score', 2, upgradeDB => {
    // Note: we don't use 'break' in this switch statement,
    // the fall-through behaviour is what we want.
    switch (upgradeDB.oldVersion) {
      case 0:
        upgradeDB.createObjectStore('scoreData', {keyPath: 'id', autoIncrement:true});
      case 1:
        var store = upgradeDB.transaction.objectStore('scoreData');
        store.createIndex('name', 'name');
      case 2:
        var store = upgradeDB.transaction.objectStore('scoreData');
        store.createIndex('score', 'score');
    }
  });

  function addPlayerScore() {
    dbPromise.then(function(db) {
      var tx = db.transaction('scoreData', 'readwrite');
      var store = tx.objectStore('scoreData');

      // parse score into number from a string
      let playerScore = player.score;
      // check if playername value is empty
      let playerNameValue = document.getElementById('playername').value;
      if(playerNameValue === '') {
        // alert user if name is empty
        alert("Please enter a name");
        return;
      } else {
        var items = [
          {
            name: playerNameValue,
            score: playerScore
          }
        ];
        items.forEach(function(item) {
          store.put(item);
        });
        store.index('score').openCursor(null, 'prev')
        .catch(function(e) {
          tx.abort();
          console.log(e);
        }).then(function(cursor) {
          return cursor.advance(5);
        }).then(function deleteRest(cursor) {
          if(!cursor) return;
          cursor.delete();
          return cursor.continue().then(deleteRest);
        }).then(function() {
          document.getElementById('addPlayerScore').style.display = "none";
          document.getElementById('playername').disabled = true;
          showPlayerScore();          
        })
      }
    });
  }

  function showPlayerScore() {
    var s = '';
    dbPromise.then(function(db) {
      var tx = db.transaction('scoreData', 'readonly');
      var store = tx.objectStore('scoreData');
      return store.index('score').openCursor(null, 'prev');
    }).then(function showRange(cursor) {
      if (!cursor) {return;}

      s += '<h4>' + cursor.value.name + '</h4><p>';
      for (var field in cursor.value) {
        if (field === 'score') {
          s += field + ': ' + cursor.value[field] + '<br/>';
        }
      }
      s += '</p>';

      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('orders').innerHTML = s;
    });
  }

  function clearAllPlayerScore() {
    dbPromise.then(function(db) {
      var tx = db.transaction('scoreData', 'readwrite');
      var store = tx.objectStore('scoreData');
      return store;
    }).then(function(store) {
      var objectStoreRequest = store.clear();
      document.getElementById('clearAllPlayerScore').style.display = "none";
      document.getElementById('orders').style.display = "none";
    }).catch(function(e){
      tx.abort();
      console.log(e);
    });
  }

  return {
    dbPromise: (dbPromise),
    addPlayerScore: (addPlayerScore),
    showPlayerScore: (showPlayerScore),
    clearAllPlayerScore: (clearAllPlayerScore)
  };
})();
