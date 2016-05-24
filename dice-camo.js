(function($, bootbox) {
    "use strict";

    function MyViewModel() {
        var self = this;

        self.masks = ko.observableArray([]);

        self.solutions = ko.observable('');

        ko.extenders.lamps = function(target, option) {
            target.subscribe(function(newValue) {
                target(newValue.replace( /[\. ]+/g, ','));
            });
            return target;
        };

        self.inputs = [
            { name: "default", text: "default", value: ko.observable('').extend({lamps: ''}) },
            { name: "temple", text: "H: Temple", value: ko.observable('').extend({lamps: ''}) },
            { name: "tree", text: "A: Tree", value: ko.observable('').extend({lamps: ''}) },
            { name: "pagoda", text: "B: Pagoda", value: ko.observable('').extend({lamps: ''}) },
            { name: "furnace", text: "C: Furnace", value: ko.observable('').extend({lamps: ''}) },
            { name: "pier", text: "G: Pier", value: ko.observable('').extend({lamps: ''}) },
            { name: "waterfall", text: "D: WaterFall", value: ko.observable('').extend({lamps: ''}) },
            { name: "rock", text: "E: Rock", value: ko.observable('').extend({lamps: ''}) },
            { name: "after", text: "after", value: ko.observable('').extend({lamps: ''}) }
        ];

        self.populateTest = function() {
            bootbox.confirm("Are you sure?", function(result) {
                if (result === true) {
                    self.inputs[0].value("11,17");
                    self.inputs[1].value("3,4,8,11,15,17,19");
                    self.inputs[2].value("4,8,9,11,12,14,15,17");
                    self.inputs[3].value("1,2,3,10,11,16,17,19");
                    self.inputs[4].value("1,6,7,9,10,11,12,14,17,20");
                    self.inputs[5].value("9,12,14");
                    self.inputs[6].value("5,13,18");
                    self.inputs[7].value("5,6,7,11,13,17,18,20");
                    self.inputs[8].value("11,17");
                }
            });
        };

        self.clear = function() {
            bootbox.confirm("Are you sure?", function(result) {
                //Example.show("Confirm result: "+result);
                //console.log('result= ', result);
                if (result === true) {
                    for (var i=0; i<9; i++) {
                        self.inputs[i].value('');
                    }
                }
            });
        };

        self.binary = function(mask) {
            var out = '';
            for (var i=0; i<20; i++) {
                out += (mask & (1 << i)) ? '1' : '0';
            }
            return out;
        };

        self.calcMasks = function() {
            var masks = [];
            for (var i=0; i < 9; i++) {
                var arrStrLights = self.inputs[i].value().split(',');
                var mask = 0;
                for(var light=0; light < arrStrLights.length; light++) {
                    mask |= 1 << (parseInt(arrStrLights[light]) - 1);
                }
                masks[i] = mask;
            }
            return masks;
        };

        // https://en.wikipedia.org/wiki/Truth_table
        // T ^ T = F
        // T ^ F = T
        // F ^ T = T
        // F ^ F = F
        self.xorInitial = function(masks) {
            //console.log('mask 0       : ', self.binary(masks[0]));
            for (var i=1; i < 8; i++) {
                //console.log('mask '+i+' before: ', self.binary(masks[i]));
                masks[i] = masks[i] ^ masks[0];
                //console.log('mask '+i+' after:  ', self.binary(masks[i]));
            }
            return masks;
        };

        self.maskToArr = function(mask) {
            var arr = [];
            for(var i=0; i<7; i++) {
                if (mask & (1 << i)) {
                    arr.push(i+1); // buttons are base = 1
                }
            }
            return arr;
        };

        self.run = function() {
            self.masks(self.xorInitial(self.calcMasks()));
            //console.log(self.masks());
            var initial = self.masks()[8];
            //status = self.simButton(2, status);
            //status = self.simButton(3, status);
            //status = self.simButton(7, status);
            //status = self.simButtons([2, 3, 7], status);
            //console.log('status: ', status, self.binary(status));
            // 1048575 = all 20 lights on

            //self.initComb();
            //for (var j=1; j<4; j++) {
            //    self.genComb();
            //}

            self.comb = [];
            for (var j=0; j<128; j++) {
                self.comb.push(self.maskToArr(j));
            }
            //console.log(JSON.stringify(self.comb));

            var solutions = '', found = 0;
            for (var i=0; i<self.comb.length; i++) {
                var status = initial;
                status = self.simButtons(self.comb[i], status);
                if (status === 1048575) {
                    found++;
                    //console.log('found possible solution: ', self.comb[i], self.combToString(self.comb[i]));
                    solutions += self.combToString(self.comb[i]) + "\n";
                }
            }
            if (found) {
                self.solutions(solutions);
            } else {
                self.solutions('none');
            }
        };

        self.combToString = function(comb) {
            var str = [];
            for (var i=0; i<comb.length; i++) {
                str.push(self.inputs[comb[i]].text);
            }
            return str.join(' + ');
        };

        self.comb = [];

        self.initComb = function() {
            self.comb = [];
            for (var i=1; i<8; i++) {
                self.comb.push([i]);
            }
        };

        self.genComb = function() {
            var len = self.comb.length,
                old;

            for (var i=0; i<len; i++) {
                for(var j=1; j<8; j++) {
                    old = self.comb[i].slice();
                    old.push(j);
                    self.comb.push(old);
                }
            }

        };

        self.simButtons = function(buttons, status) {
            for (var i=0; i < buttons.length; i++) {
                status = self.simButton(buttons[i], status);
            }
            return status;
        };

        self.simButton = function(button, status) {
            return status ^ self.masks()[button];
        };

    }

    ko.applyBindings(new MyViewModel());

}(jQuery, bootbox));