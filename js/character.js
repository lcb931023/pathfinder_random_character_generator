angular.module('character', [])
  .controller('CharacterController', function() {

    this.str = Math.floor(Math.random() * 10) + 10;
    this.dex = Math.floor(Math.random() * 10) + 10;
    this.con = Math.floor(Math.random() * 10) + 10;
    this.int = Math.floor(Math.random() * 10) + 10;
    this.wis = Math.floor(Math.random() * 10) + 10;
    this.cha = Math.floor(Math.random() * 10) + 10;

  });
