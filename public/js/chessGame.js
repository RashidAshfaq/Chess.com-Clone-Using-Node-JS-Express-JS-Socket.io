const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
        const squareElement = document.createElement('dev');
        squareElement.classList.add('square', 
            (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark" 
        )
        squareElement.dataset.row = rowIndex; 
        squareElement.dataset.col = squareIndex;
       if(square){
        const pieceElement = document.createElement('dev');
        pieceElement.classList.add("piece", (square.color === "w" ? "white" : "black"));
        pieceElement.innerHTML = getPieceUniCode(square);
        pieceElement.draggable = playerRole === square.color;
        
        pieceElement.addEventListener('dragstart', (e) => {
            if(pieceElement.draggable){
                draggedPiece = pieceElement;
                sourceSquare = { row: rowIndex, col: squareIndex};
                e.dataTransfer.setData("text/plain", "");
            }
        })
        
        pieceElement.addEventListener("dragend", (e) => {
            draggedPiece = null;
            sourceSquare = null;
        });
        
        squareElement.appendChild(pieceElement);
    }
        
        squareElement.addEventListener('dragover', function (e) {
            e.preventDefault();
        })

        squareElement.addEventListener('drop', function(e) {
            e.preventDefault();
            if (draggedPiece) {
                const targetSquare = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col)
                };
        
                handleMove(sourceSquare, targetSquare);
            }
        });
        
      boardElement.appendChild(squareElement);
    })
  });
  if(playerRole === 'b'){
    boardElement.classList.add('flipped');
  } else {
    boardElement.classList.remove('flipped');
  }
};
const handleMove = (source, target) => {
    const move = {
      from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
      to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
      promotion: 'q' // Always promote to a queen if applicable
    }

    socket.emit('move', move);
};


const getPieceUniCode = (piece) => {
    const uniCodePieces = {
        K: '\u2654',   // ♔ White King
        Q: '\u2655',   // ♕ White Queen
        R: '\u2656',   // ♖ White Rook
        B: '\u2657',   // ♗ White Bishop
        N: '\u2658',   // ♘ White Knight
        P: '\u2659',   // ♙ White Pawn
        k: '\u265A',   // ♚ Black King
        q: '\u265B',   // ♛ Black Queen
        r: '\u265C',   // ♜ Black Rook
        b: '\u265D',   // ♝ Black Bishop
        n: '\u265E',   // ♞ Black Knight
        p: '\u265F'    // ♟ Black Pawn
    };

    return uniCodePieces[piece.type] || "";
};


socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
} )

socket.on("boardState", function (fen) {
    chess.load(fen);
    renderBoard();
})


socket.on("move", function (move) {
    chess.move(move);
    renderBoard();
})

renderBoard();

// socket.emit('userJoin');

// socket.on('user2Join', () => {
//     console.log('User 2 join form frontend');
// })

// socket.emit('disconnect');