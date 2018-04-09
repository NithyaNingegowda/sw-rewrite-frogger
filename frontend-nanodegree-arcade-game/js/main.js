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
        upgradeDB.createObjectStore('keyval');
      case 1:
        upgradeDB.createObjectStore('objs', {keyPath: 'id', autoIncrement:true});
      case 2:
        console.log('Creating a name index');
        var store = upgradeDB.transaction.objectStore('objs');
        store.createIndex('name', 'name');
      case 3:
        console.log('Creating a score index');
        var store = upgradeDB.transaction.objectStore('objs');
        store.createIndex('score', 'score');
    }
  });

  function addPlayerScore() {
    dbPromise.then(function(db) {
      var tx = db.transaction('objs', 'readwrite');
      var store = tx.objectStore('objs');
      var items = [
        {
          name: document.getElementById('playername').value,
          score: document.getElementsByClassName('final-score')[0].innerHTML
        }
      ];
      return Promise.all(items.map(function(item) {
          console.log('Adding item: ', item);
          return store.put(item);
        })
      ).catch(function(e) {
        tx.abort();
        console.log(e);
      }).then(function() {
        document.getElementById('addPlayerScore').style.display = "none";
        document.getElementById('playername').disabled = true;
        console.log('All items added successfully!');
        showPlayerScore();
      });
    });
  }

  function showPlayerScore() {
    var s = '';
    dbPromise.then(function(db) {
      var tx = db.transaction('objs', 'readonly');
      var store = tx.objectStore('objs');
      return store.openCursor();
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);

      s += '<h2>' + cursor.value.name + '</h2><p>';
      for (var field in cursor.value) {
        if (field === 'score') {
          s += field + '=' + cursor.value[field] + '<br/>';
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
      var tx = db.transaction('objs', 'readwrite');
      var store = tx.objectStore('objs');
      return store;
    }).then(function(store) {
      var objectStoreRequest = store.clear();
      console.log('IndexedDB cleared');
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
