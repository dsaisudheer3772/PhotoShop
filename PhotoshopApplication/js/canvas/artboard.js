let canvasWrapper = document.getElementsByClassName("canvas-wrapper")[0];
let sliderContainer = document.getElementsByClassName("slidecontainer")[0]; //brush width

class artBoard {
  constructor(index) {
    this.cIndex = index || 0;
    this.canvas = document.createElement("canvas");
    this.canvasWrapper = canvasWrapper; //  here get canvas document.getElementsByClassName("canvas-wrapper")[0];
    this.canvasWrapper.appendChild(this.canvas); //Click the button to append an layer to the end of the list.
    this.canvas.height = this.canvasWrapper.offsetHeight; //done
    this.canvas.width = this.canvasWrapper.offsetWidth; // done
    this.canvas.style.position = "absolute"; // not done
    this.context = this.canvas.getContext("2d"); //done
    this.sliderContainer = sliderContainer; //let sliderContainer = document.getElementsByClassName("slidecontainer")[0];
    this.sliderContainer.style.display = "none";
    this.slider = slider; //let slider = document.getElementById("slider");
    // for undo purpose
    this.undoStack = [];
    this.undoLimit = 3;

    this.startPos; // start position reference mouseDownDotPos
    this.currentPos; //mouseUpDotPos

    this.dragging = false;
    this.dragStartLocation;

    this.selectionSelectFlag = false;
    this.selectSelectFlag = false;
    this.lineSelectFlag = false;
    this.circleSelectFlag = false;
    this.triangleSelectFlag = false;
    this.penSelectFlag = false;
    this.reactangleSelectFlag = false;
    this.brushSelectFlag = false;
    this.eraserSelectFlag = false;
    this.textSelectFlag = false;
    this.eraserSelectFlag = false;

    this.offsetX = this.canvas.offsetLeft;
    this.offsetY = this.canvas.offsetTop;

    this.startX;
    this.startY;
    this.isDown = false;
    this.mouseFlag = false;

    this.imgFlag = false;
    this.pi2 = Math.PI * 2;
    this.resizerRadius = 4;
    this.rr = this.resizerRadius * this.resizerRadius;
    this.draggingResizer;
    this.imageX = 0; // under control
    this.imageY = 0; // under control
    this.imageWidth;
    this.imageHeight;
    this.imageRight;
    this.imageBottom;
    this.draggingImage = false;
    this.startX;
    this.startY;

    this.flag = false;
    this.brushColor;
    this.brushSize;
    this.context.lineWidth = this.slider.value;
    this.brushSize = this.slider.value / 2;

    this.slider.addEventListener("input", (event) => {
      this.context.lineWidth = this.slider.value;
      this.brushSize = this.slider.value / 2;
      console.log(this.slider.value);
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.dragging = true;
      this.startPos_x = e.offsetX;
      this.startPos_y = e.offsetY;
      console.log(this.startPos_x, this.startPos_y);
      if (this.brushSelectFlag || this.eraserSelectFlag) {
        // case 'brushSelectFlag'
        this.enableFlag(e, this);
        console.log(this.brushSelectFlag);
      }
      if (this.selectionSelectFlag) {
        this.handleMouseDown(e);
        console.log("mousedown");
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      this.dragEnd_x = e.offsetX;
      this.dragEnd_y = e.offsetY;
      if (this.brushSelectFlag || this.eraserSelectFlag) {
        // case 'brushSelectFlag'
        this.plotPoints(e, this);
      }
      if (this.selectionSelectFlag) {
        this.handleMouseMove(e);
        console.log("mousemove");
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      this.dragging == false;
      this.dragEnd_x = e.offsetX;
      this.dragEnd_y = e.offsetY;
      //console.log(this.dragEnd_x, this.dragEnd_y);
      if (this.lineSelectFlag == true) {
        this.context.beginPath();
        this.context.strokeStyle = this.brushColor;
        this.context.moveTo(this.startPos_x, this.startPos_y);
        this.context.lineTo(this.dragEnd_x, this.dragEnd_y);
        this.context.stroke();
      }
      if (this.circleSelectFlag == true) {
        this.context.beginPath();
        this.context.strokeStyle = this.brushColor;
        this.distance = Math.sqrt(
          Math.pow(this.dragEnd_x - this.startPos_x, 2) +
            Math.pow(this.dragEnd_y - this.startPos_y, 2)
        );
        this.context.arc(
          this.startPos_x,
          this.startPos_y,
          this.distance,
          0,
          2 * Math.PI,
          false
        );
        this.context.stroke();
      }
      if (this.triangleSelectFlag == true) {
        this.context.beginPath();
        this.context.strokeStyle = this.brushColor;
        this.context.moveTo(
          this.startPos_x + (this.dragEnd_x - this.startPos_x) / 2,
          this.startPos_y
        );
        this.context.lineTo(this.startPos_x, this.dragEnd_y);
        this.context.lineTo(this.dragEnd_x, this.dragEnd_y);
        this.context.closePath();
        this.context.stroke();
      }
      if (this.reactangleSelectFlag == true) {
        this.context.beginPath();
        this.context.strokeStyle = this.brushColor;
        this.context.rect(
          this.startPos_x,
          this.startPos_y,
          this.dragEnd_x - this.startPos_x,
          this.dragEnd_y - this.startPos_y
        );
        this.context.closePath();
        this.context.stroke();
      }
      if (this.brushSelectFlag || this.eraserSelectFlag) {
        this.disableFlag(this);
      }
      if (this.selectionSelectFlag) {
        this.handleMouseUp(e);
        console.log("mouseup");
      }
    });

    this.canvas.addEventListener("mouseout", (e) => {
      if (this.selectionSelectFlag) {
        this.handleMouseOut(e);
        console.log("mouseout");
      }
    });

    this.canvas.addEventListener("dblclick", (e) => {
      if (this.selectionSelectFlag) {
        this.handleDblClick(e);
        console.log("double click");
      }
    });
  }

  resetSelectionFlag() {
    this.selectionSelectFlag = false;
    this.selectSelectFlag = false;
    this.lineSelectFlag = false;
    this.circleSelectFlag = false;
    this.triangleSelectFlag = false;
    this.penSelectFlag = false;
    this.reactangleSelectFlag = false;
    this.brushSelectFlag = false;
    this.eraserSelectFlag = false;
    this.textSelectFlag = false;
    this.eraserSelectFlag = false;
  }

  plotPoints(event, that) {
    if (that.flag && that.brushSelectFlag) {
      this.context.strokeStyle = this.brushColor;
      that.context.fillStyle = that.brushColor;
      //console.log(event.offsetX, event.offsetY);
      that.context.stroke();
      that.context.beginPath();
      that.context.arc(
        this.dragEnd_x,
        this.dragEnd_y,
        that.brushSize,
        0,
        2 * Math.PI
      );
      that.context.fill();
    }
    if (that.flag && that.eraserSelectFlag) {
      that.context.globalCompositeOperation = "destination-out";
      that.context.arc(
        event.offsetX,
        event.offsetY,
        that.brushSize,
        0,
        Math.PI * 2,
        false
      );
      that.context.fill();
    }
  }

  enableFlag(event, that) {
    that.flag = true;
    that.plotPoints(event, that);
  }

  disableFlag(that) {
    that.flag = false;
    that.context.beginPath();
  }

  loadImage(source) {
    this.img = new Image();
    this.img.onload = () => {
      console.log(this.img);
      this.imageWidth = this.img.width;
      this.imageHeight = this.img.height;
      this.imageRight = this.imageX + this.imageWidth;
      this.imageBottom = this.imageY + this.imageHeight;
      this.draw(true, false);
    };

    this.img.src = source;
  }

  draw(withAnchors, withBorders) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(
      this.img,
      0,
      0,
      this.img.width,
      this.img.height,
      this.imageX,
      this.imageY,
      this.imageWidth,
      this.imageHeight
    );

    if (this.selectionSelectFlag) {
      if (withAnchors) {
        this.drawDragAnchor(this.imageX, this.imageY);
        this.drawDragAnchor(this.imageRight, this.imageY);
        this.drawDragAnchor(this.imageRight, this.imageBottom);
        this.drawDragAnchor(this.imageX, this.imageBottom);
      }
    }
  }

  drawDragAnchor(x, y) {
    this.context.beginPath();
    this.context.arc(x, y, this.resizerRadius, 0, this.pi2, false);
    this.context.closePath();
    this.context.fill();
  }

  anchorHitTest(x, y) {
    let dx, dy;
    dx = x - this.imageX;
    dy = y - this.imageY;
    if (dx * dx + dy * dy <= this.rr) {
      return 0;
    }
    dx = x - this.imageRight;
    dy = y - this.imageY;
    if (dx * dx + dy * dy <= this.rr) {
      return 1;
    }
    dx = x - this.imageRight;
    dy = y - this.imageBottom;
    if (dx * dx + dy * dy <= this.rr) {
      return 2;
    }
    dx = x - this.imageX;
    dy = y - this.imageBottom;
    if (dx * dx + dy * dy <= this.rr) {
      return 3;
    }
    return -1;
  }

  hitImage(x, y) {
    return (
      x > this.imageX &&
      x < this.imageX + this.imageWidth &&
      y > this.imageY &&
      y < this.imageY + this.imageHeight
    );
  }

  handleMouseDown(e) {
    this.startX = parseInt(e.clientX - this.offsetX);
    this.startY = parseInt(e.clientY - this.offsetY);
    this.draggingResizer = this.anchorHitTest(this.startX, this.startY);
    this.draggingImage =
      this.draggingResizer < 0 && this.hitImage(this.startX, this.startY);
  }

  handleMouseUp(e) {
    this.draggingResizer = -1;
    this.draggingImage = false;
    if (!this.mouseFlag) {
      this.draw(true, false);
    }
  }

  handleMouseOut(e) {
    this.handleMouseUp(e);
  }

  handleDblClick(e) {
    if (this.mouseFlag) {
      this.draw(true, true);
      this.mouseFlag = false;
    } else {
      this.draw(false, true);
      this.mouseFlag = true;
    }
  }

  handleMouseMove(e) {
    if (!this.mouseFlag) {
      if (this.draggingResizer > -1) {
        this.mouseX = parseInt(e.clientX - this.offsetX);
        this.mouseY = parseInt(e.clientY - this.offsetY);

        switch (this.draggingResizer) {
          case 0:
            //top-left
            this.imageX = this.mouseX;
            this.imageWidth = this.imageRight - this.mouseX;
            this.imageY = this.mouseY;
            this.imageHeight = this.imageBottom - this.mouseY;
            break;
          case 1:
            //top-right
            this.imageY = this.mouseY;
            this.imageWidth = this.mouseX - this.imageX;
            this.imageHeight = this.imageBottom - this.mouseY;
            break;
          case 2:
            //bottom-right
            this.imageWidth = this.mouseX - this.imageX;
            this.imageHeight = this.mouseY - this.imageY;
            break;
          case 3:
            //bottom-left
            this.imageX = this.mouseX;
            this.imageWidth = this.imageRight - this.mouseX;
            this.imageHeight = this.mouseY - this.imageY;
            break;
        }

        if (this.imageWidth < 25) {
          this.imageWidth = 25;
        }
        if (this.imageHeight < 25) {
          this.imageHeight = 25;
        }

        // set the image right and bottom
        this.imageRight = this.imageX + this.imageWidth;
        this.imageBottom = this.imageY + this.imageHeight;

        // redraw the image with resizing anchors
        this.draw(true, true);
      } else if (this.draggingImage) {
        this.imageClick = false;

        this.mouseX = parseInt(e.clientX - this.offsetX);
        this.mouseY = parseInt(e.clientY - this.offsetY);
        let dx = this.mouseX - this.startX;
        let dy = this.mouseY - this.startY;
        this.imageX += dx;
        this.imageY += dy;
        this.imageRight += dx;
        this.imageBottom += dy;
        this.startX = this.mouseX;
        this.startY = this.mouseY;
        this.draw(false, true);
      }
    }
  }
}
