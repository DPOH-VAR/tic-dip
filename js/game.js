function Game( scene, gameMesh ){
    var DISTANCE = 20;

    var pointIndex = 4;
    var playerIndex = 0;

    var positions = [
        [-2,+2,+3],[+0,+2,+3],[+2,+2,+3], [-2,+0,+3],[+0,+0,+3],[+2,+0,+3], [-2,-2,+3],[+0,-2,+3],[+2,-2,+3],
        [+3,+2,+2],[+3,+2,+0],[+3,+2,-2], [+3,+0,+2],[+3,+0,+0],[+3,+0,-2], [+3,-2,+2],[+3,-2,+0],[+3,-2,-2],
        [+2,+2,-3],[+0,+2,-3],[-2,+2,-3], [+2,+0,-3],[+0,+0,-3],[-2,+0,-3], [+2,-2,-3],[+0,-2,-3],[-2,-2,-3],
        [-3,+2,-2],[-3,+2,+0],[-3,+2,+2], [-3,+0,-2],[-3,+0,+0],[-3,+0,+2], [-3,-2,-2],[-3,-2,+0],[-3,-2,+2],
        [+2,+3,+2],[+0,+3,+2],[-2,+3,+2], [+2,+3,+0],[+0,+3,+0],[-2,+3,+0], [+2,+3,-2],[+0,+3,-2],[-2,+3,-2],
        [+2,-3,-2],[+0,-3,-2],[-2,-3,-2], [+2,-3,+0],[+0,-3,+0],[-2,-3,+0], [+2,-3,+2],[+0,-3,+2],[-2,-3,+2]
    ].map(function(xyz){
        return new THREE.Vector3(xyz[0],xyz[1],xyz[2])
    });

    var viewNormals = positions.map(function(v){
        return new THREE.Vector3(
                v.x<3 && v.x>-3 ? 0 : v.x > 0 ? 1 : -1,
                v.y<3 && v.y>-3 ? 0 : v.y > 0 ? 1 : -1,
                v.z<3 && v.z>-3 ? 0 : v.z > 0 ? 1 : -1
        )
    });

    var viewPoints = viewNormals.map(function(normal,i){
        return normal.clone().multiplyScalar(DISTANCE).add(positions[i])
    });

    var rotateAxis = [
        {points:[ 0, 1, 2, 9,10,11,18,19,20,27,28,29],normal:new THREE.Vector3(0,1,0)},
        {points:[ 3, 4, 5,12,13,14,21,22,23,30,31,32],normal:new THREE.Vector3(0,1,0)},
        {points:[ 6, 7, 8,15,16,17,24,25,26,33,34,35],normal:new THREE.Vector3(0,1,0)},

        {points:[ 0, 3, 6,53,50,47,26,23,20,44,41,38],normal:new THREE.Vector3(1,0,0)},
        {points:[ 1, 4, 7,52,49,46,25,22,19,43,40,37],normal:new THREE.Vector3(1,0,0)},
        {points:[ 2, 5, 8,51,48,45,24,21,18,42,39,36],normal:new THREE.Vector3(1,0,0)},

        {points:[15,12, 9,36,37,38,29,32,35,53,52,51],normal:new THREE.Vector3(0,0,1)},
        {points:[16,13,10,39,40,41,28,31,34,50,49,48],normal:new THREE.Vector3(0,0,1)},
        {points:[17,14,11,42,43,44,27,30,33,47,46,45],normal:new THREE.Vector3(0,0,1)},
    ];
    rotateAxis = rotateAxis.concat(rotateAxis.map(function(line){
        return {points:line.points.slice(0).reverse(),normal: line.normal.clone().negate()}
    }));

    var lines = [];
    var gameMap = [
        // horizontal
        [ 0, 1, 2, 9,10,11,18,19,20,27,28,29],
        [ 3, 4, 5,12,13,14,21,22,23,30,31,32],
        [ 6, 7, 8,15,16,17,24,25,26,33,34,35],
        // vertical
        [ 0, 3, 6,53,50,47,26,23,20,44,41,38],
        [ 1, 4, 7,52,49,46,25,22,19,43,40,37],
        [ 2, 5, 8,51,48,45,24,21,18,42,39,36],
        [ 9,12,15,51,52,53,35,32,29,38,37,36],
        [10,13,16,48,49,50,34,31,28,41,40,39],
        [11,14,17,45,46,47,33,30,27,44,43,42],
        // diagonal 1-8
        [34,30,20,43,39, 9, 5, 7,53],
        [23,19,42,10,12, 8,52,50,33],
        [39,37, 0,32,34,47,25,21,11],
        [14,10,36, 1, 3,35,50,46,24],
        [23,25,45,16,12, 2,37,41,27],
        [28,30,26,46,48,15, 5, 1,38],
        [14,16,51, 7, 3,29,41,43,18],
        [28,32, 6,52,48,17,21,19,44],
    ];

    var field = this.field = [];
    var look = this.look = new THREE.Mesh();
    var control = false;
    var resetControl = false;
    var gameAI = new GameAI(0.2);

    var cubeGeometry = new THREE.BoxGeometry( 5.5, 5.5, 5.5 );
    var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0.9 });
    
    
    var cubeMesh = new THREE.Mesh( cubeGeometry, cubeMaterial );
    gameMesh.add( cubeMesh );
    var playerGeometries = [null, new THREE.TorusGeometry( 0.6, 0.15, 10, 40 )];
    var borderGeometry = new THREE.TorusGeometry( 1, 0.2, 10, 32 );
    var playerMeshMaterials = [
        new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0xff0000, shininess: 20 }),
        new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x00ffff, shininess: 20 })
    ];
    var playerBorderMaterials = playerMeshMaterials;
    var borderMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0xffff80, shininess: 20 });
    var noMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x101010, shininess: 20 });
    var loader = new THREE.JSONLoader();
    loader.load('models/cross.json',function(crossGeometry){
        crossGeometry.computeVertexNormals();
        playerGeometries[0] = crossGeometry;
        positions.forEach(function(position, index){
            var viewPoint = viewPoints[index];
            var viewNormal = viewNormals[index];
            var gamePoint = {
                _value: -1,
                _meshes: [0,1].map(function(i){
                    var mesh = new THREE.Mesh( playerGeometries[i], playerMeshMaterials[i] );
                    mesh.position.copy( viewNormal ).multiplyScalar( 0.8 ).add( position );
                    mesh.lookAt( viewPoint );
                    mesh.visible = false;
                    gameMesh.add( mesh );
                    return mesh
                }),
                _border: new THREE.Mesh( borderGeometry, borderMaterial ),
                unselect: function(){
                    this._border.material = borderMaterial;
                },
                select: function(player){
                    if (player == null) {
                        player = playerIndex;
                        field.forEach(function(point){ point.unselect() });
                    }
                    if (player == -1 ) this._border.material = noMaterial;
                    else this._border.material = playerBorderMaterials[player];
                },
                value: function(value){
                    if (value == null) return this._value;
                    this._value = value;
                    this._meshes[0].visible = value==0;
                    this._meshes[1].visible = value==1;
                }
            };
            gamePoint._border.position.copy( position );
            gamePoint._border.lookAt( viewPoint );
            gameMesh.add( gamePoint._border );
            field.push( gamePoint );
        });
        start();
    });

    function start(){
        lines = gameMap.map(function(line){return new Line( line )});
        control = true;
        selectPoint( pointIndex );
        field[pointIndex].select();
    }

    function findNextPoint(vec){
        var v = vec.clone().normalize();
        v.applyQuaternion(look.quaternion);
        var viewNormal = viewNormals[pointIndex];
        stableVector(v.cross(viewNormal).negate());
        var points = null;
        rotateAxis.filter(function(line){
            return ~line.points.indexOf(pointIndex);
        }).every(function(line){
            points = line.points;
            return !v.equals(line.normal);
        });
        return points[(points.indexOf(pointIndex)+1)%points.length]
    }

    function stableVector(vec){
        vec.x = vec.x < -0.8 ? -1 : vec.x > 0.8 ? 1 : 0;
        vec.y = vec.y < -0.8 ? -1 : vec.y > 0.8 ? 1 : 0;
        vec.z = vec.z < -0.8 ? -1 : vec.z > 0.8 ? 1 : 0;
    }

    function selectPoint(index){
        var viewNormal = new THREE.Vector3().subVectors(positions[pointIndex],viewPoints[pointIndex]).normalize();
        var targetNormal = new THREE.Vector3().subVectors(positions[index],viewPoints[index]).normalize();
        var quaternion = new THREE.Quaternion().setFromUnitVectors(viewNormal,targetNormal);
        var matrix = new THREE.Matrix4().makeRotationFromQuaternion( quaternion );
        look.applyMatrix(matrix);
        look.position.copy(viewPoints[index]);
        pointIndex = index;
    }

    this.registerKeyControls = function(params){
        var left = params.left, leftKey = true;
        var right = params.right, rightKey = true;
        var up = params.up, upKey = true;
        var down = params.down, downKey = true;
        var menu = params.menu, menuKey = true;
        var select = params.select, selectKey = true;
        var rotateLeft = params.rotateLeft, rotateLeftKey = true;
        var rotateRight = params.rotateRight, rotateRightKey = true;

        var vectorUp = new THREE.Vector3(0,1,0);
        var vectorDown = new THREE.Vector3(0,-1,0);
        var vectorLeft = new THREE.Vector3(-1,0,0);
        var vectorRight = new THREE.Vector3(1,0,0);

        window.addEventListener('keydown',(function(event){
            var key = event.keyCode;
            if (event.shiftKey) key += 1000;
            if (leftKey && ~left.indexOf(key)){ clickMove(vectorLeft); leftKey = false}
            if (rightKey && ~right.indexOf(key)){ clickMove(vectorRight); rightKey = false}
            if (upKey && ~up.indexOf(key)){ clickMove(vectorUp); upKey = false}
            if (downKey && ~down.indexOf(key)){ clickMove(vectorDown); downKey = false}
            if (rotateLeftKey && ~rotateLeft.indexOf(key)){ clickRotate(-Math.PI/2); rotateLeftKey = false}
            if (rotateRightKey && ~rotateRight.indexOf(key)){ clickRotate(Math.PI/2); rotateRightKey = false}
            if (menuKey && ~menu.indexOf(key)){ clickMenu(); menuKey = false}
            if (selectKey && ~select.indexOf(key)){ clickSelect(); selectKey = false}
            // 88x 79o 90z
            if (window['cheat'] && key == 88) field[pointIndex].value(0);
            if (window['cheat'] && key == 79) field[pointIndex].value(1);
            if (window['cheat'] && key == 90) field[pointIndex].value(-1);
            if (window['cheat'] && key == 67) console.log(pointIndex);
        }));
        window.addEventListener('keyup',(function(event){
            var key = event.keyCode;
            if (event.shiftKey) key += 1000;
            if (~left.indexOf(key)) leftKey = true;
            if (~right.indexOf(key)) rightKey = true;
            if (~up.indexOf(key)) upKey = true;
            if (~down.indexOf(key)) downKey = true;
            if (~rotateLeft.indexOf(key)) rotateLeftKey = true;
            if (~rotateRight.indexOf(key)) rotateRightKey = true;
            if (~menu.indexOf(key)) menuKey = true;
            if (~select.indexOf(key)) selectKey = true;
        }));
    };

    function clickMove(vector){
        if (!control) return;
        var next = findNextPoint( vector );
        selectPoint( next );
        if (!resetControl) field[pointIndex].select();
    }
    function checkWin(pointIndex, player){
        var win = null;
        lines.filter(function(line){
            return line.has(pointIndex)
        }).forEach(function(line){
            var patternIndex = line.findPattern(pointIndex,"XXXXX",player);
            if (patternIndex == null) return;
            win = true;
            console.log('PLAYER '+player+' win');
            var points = [];
            for (var i=0; i<5; i++) points.push(line.getPoint(patternIndex+i));
            field.forEach(function(point){point.select(-1)});
            points.forEach(function(point){point.select(player)});
        });
        if (win) resetControl = true;
        return win
    }
    function clickSelect(){
        if (!control) return;
        if (resetControl == true) {
            field.forEach(function(point){ point.value( -1 ) });
            field[pointIndex].select();
            resetControl = false;
            return;
        }
        if ( field[pointIndex].value() != -1 ) return;
        field[pointIndex].value(playerIndex);
        var win = checkWin(pointIndex,playerIndex);
        playerIndex = 1-playerIndex;
        if (win) return;
        field[pointIndex].select();

        // AI

        control = false;
        var step = gameAI.getBestStep(playerIndex);
        setTimeout(function(){
            selectPoint( step );
            field[step].select();
        },1000);
        setTimeout(function(){
            field[pointIndex].value(playerIndex);
            var win = checkWin(pointIndex,playerIndex);
            playerIndex = 1-playerIndex;
            if (!win) field[pointIndex].select();
            control = true;
        },2000);


    }
    function clickRotate(deg){
        var viewNormal = new THREE.Vector3().subVectors(positions[pointIndex],viewPoints[pointIndex]).normalize();
        var matrix = new THREE.Matrix4().makeRotationAxis(viewNormal, deg );
        look.applyMatrix(matrix);
        look.position.copy(viewPoints[pointIndex]);
    }
    function clickMenu(){
        console.log('todo: create menu =)');
    }

    function Line(lineArray){
        this.lineArray = lineArray; // todo: remove line
        var size = lineArray.length;
        var pointArray = lineArray.map(function(e){
            return field[e];
        });
        this.getPoint = function(index){
            return pointArray[ (index%size+size)%size ];
        };
        this.has = function(index){
            return lineArray.indexOf(index) != -1
        };
        this.findPattern = function(index, pattern, player, soft){
            var pos = lineArray.indexOf(index);
            var chars = pattern.split('');
            pattern: for (var i=0; i<chars.length; i++) {
                if (chars[i] != 'X') continue;
                for (var j=pos-i; j<pos-i+chars.length; j++) {
                    if ( j==pos ) continue;
                    if (chars[j-pos+i] == 'X' && this.getPoint(j).value() != player) continue pattern;
                    if (!soft && chars[j-pos+i] == '-' && this.getPoint(j).value() != -1) continue pattern;
                    if (chars[j-pos+i] == '-' && this.getPoint(j).value() == 1-player) continue pattern;
                }
                return pos-i;
            }
            return null;
        };
    }

    function GameAI(dif){
        if (dif == null) dif = 0.1;

        var WIN_PATTERN = 'XXXXX';
        var PRE_WIN_PATTERN = '-XXXX-';
        var DANDER_PATTERN = '-XXX-';
        var GOOD_PATTERNS = ['XX---','X-X--','X--X-','X---X','-XX--','-X-X-','-X--X','--XX-','--X-X','---XX','XX---'];
        var LIKE_PATTERNS = ['X----','-X---','--X--','---X-','----X'];

        var INIT_SCORE = 1;
        var WIN_SCORE = 10000000;
        var OPPONENT_WIN_SCORE = 200000;
        var PRE_WIN_SCORE = 50000;
        var OPPONENT_PRE_WIN_SCORE = 10000;
        var DANGER_SCORE = 1000;
        var OPPONENT_DANGER_SCORE = 200;
        var GOOD_SCORE = 20;
        var OPPONENT_GOOD_SCORE = 10;
        var LIKE_SCORE = 2;
        var OPPONENT_LIKE_SCORE = 1;

        this.getBestStep = function(player){
            var nodes = [];
            field.forEach(function(point, index){
                if ( point.value() == -1 ) nodes.push({
                    index: index,
                    point: point,
                    score: INIT_SCORE,
                    lines: lines.filter(function(line){
                        return line.has( index );
                    })
                });
            });

            nodes.forEach(function(node){
                // find win pattern
                var win = node.lines.some(function(line){
                    return null != line.findPattern( node.index, WIN_PATTERN, player )
                });
                if (win) node.score += WIN_SCORE;

                // find lose pattern
                var lose = node.lines.some(function(line){
                    return null != line.findPattern( node.index, WIN_PATTERN, 1-player )
                });
                if (lose) node.score += OPPONENT_WIN_SCORE;

                // find pre-win pattern
                var preWin = node.lines.some(function(line){
                    return null != line.findPattern( node.index, PRE_WIN_PATTERN, player )
                });
                if (preWin) node.score += PRE_WIN_SCORE;

                // find pre-lose pattern
                var preLose = node.lines.some(function(line){
                    return null != line.findPattern( node.index, PRE_WIN_PATTERN, 1-player )
                });
                if (preLose) node.score += OPPONENT_PRE_WIN_SCORE;

                var dangerWinLines = node.lines.filter(function(line){
                    return null != line.findPattern( node.index, DANDER_PATTERN, player , true )
                });
                if (dangerWinLines.length >= 2) node.score += DANGER_SCORE;

                var dangerLoseLines = node.lines.filter(function(line){
                    return null != line.findPattern( node.index, DANDER_PATTERN, 1-player , true )
                });
                if (dangerLoseLines.length >= 2) node.score += OPPONENT_DANGER_SCORE;

                GOOD_PATTERNS.forEach(function(pattern){
                    node.lines.forEach(function(line){
                        if ( null != line.findPattern( node.index, pattern, player )) {
                            node.score += GOOD_SCORE;
                        }
                        if ( null != line.findPattern( node.index, pattern, 1-player )) {
                            node.score += OPPONENT_GOOD_SCORE
                        }
                    });
                });

                LIKE_PATTERNS.forEach(function(pattern){
                    node.lines.forEach(function(line){
                        if ( null != line.findPattern( node.index, pattern, player )) {
                            node.score += LIKE_SCORE;
                        }
                        if ( null != line.findPattern( node.index, pattern, 1-player )) {
                            node.score += OPPONENT_LIKE_SCORE;
                        }
                    });
                });

            });
            nodes.forEach(function(node){
                node.score += node.score*dif*Math.random()
            });
            nodes.sort(function(a,b){return b.score - a.score});
            console.log(nodes.map(function(a){return "[" + a.index + "] " + Math.floor(a.score)}));
            console.log("AI STEP SCORE:", nodes[0].score, "GOOD:", nodes[0].good, "LIKE:", nodes[0].like);
            return nodes[0].index
        };
    }

}




















