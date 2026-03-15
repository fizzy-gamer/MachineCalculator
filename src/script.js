import { MachinesData } from "./MachineData.js";
import { MachineIcons } from "./MachineIcons.js";

//Setup buttons
var MachineButtons = document.getElementById("MachineButtons");
function LoadIcons() {
  for (let [MachineName, Data] of Object.entries(MachinesData)) { 

    let Button = document.createElement("button");
    Button.className = "DeselectedButton";
    Button.value = MachineName;
    Button.id = MachineName+"Button";
    Button.onclick = function () {
      MachineClicked(Button);
    };
    MachineButtons.appendChild(Button);

    let ButtonIcon = document.createElement("img");
    ButtonIcon.src = MachineIcons[MachineName];
    ButtonIcon.className = "MachineIcon";
    Button.appendChild(ButtonIcon);

    let ButtonText = document.createElement("p");
    ButtonText.className = "MachineText";
    ButtonText.innerHTML = MachineName + ': <span class="MoneyText">$' + Intl.NumberFormat("en-UK").format(Data.Price) + "</span>";
    Button.appendChild(ButtonText);
  };
};
LoadIcons();

function SearchFilter() {
  const Input = document.getElementById("MachineSearch");
  const Query = Input.value.toUpperCase();
  const Buttons = MachineButtons.getElementsByTagName("button");
  for (let i = 0; i < Buttons.length; i++) {
    let MachineName = Buttons[i].value;
    if (MachineName.toUpperCase().indexOf(Query) > -1) {
      Buttons[i].style.display = "";
    } else {
      Buttons[i].style.display = "none";
    };
  };
};

//Button Handlers
document.getElementById("MachineSearch").onkeyup = function() {SearchFilter();};
document.getElementById("AddSelected").onclick = function() {AddMachines();};
document.getElementById("Deselect").onclick = function() {DeselectMachines();};
document.getElementById("ClearMachines").onclick = function() {ClearCurrentMachines();};

//Sort
var Machines = MachineButtons.children;
Machines = Array.from(Machines).sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
Machines.forEach(Machine => {MachineButtons.appendChild(Machine);});

//////////////////////////////////////////////////////////////

//Main
var SelectedMachines = [];
var AddMachinesSelectedText = document.getElementById("AddMachinesSelected");
var CurrentMachinesSelectedText = document.getElementById("CurrentMachinesSelected");
var CurrentMachines = {};
var SelectedMachineButtons = document.getElementById("SelectedMachineButtons");

var MachinesPriceText = document.getElementById("MachinesPrice");
var MachinesPowerText = document.getElementById("MachinesPower");
var MachinesPollutionText = document.getElementById("MachinesPollution");

function NewMachineButton(MachineButton, Name, Amount, Power) {
  if (Amount == null) {Amount = 0;};
  if (Power == null) {Power = 0;};

  CurrentMachines[Name] = {Amount:Amount, Power:Power, MachineName:MachineButton.value};

  let NewButton = MachineButton.cloneNode(true);
  NewButton.className = "MachineButton";
  NewButton.id = Name;
  
  let AmountInput = document.createElement("input");
  AmountInput.className = "AmountInput";
  AmountInput.placeholder = "Machines";
  AmountInput.type = "number";
  AmountInput.step = "1";
  AmountInput.min = "0";
  if (Amount != 0) {AmountInput.value = Amount;};
  AmountInput.addEventListener("input", function(){CurrentMachines[Name].Amount = parseFloat(AmountInput.value)!= NaN ? parseFloat(AmountInput.value): 0; UpdateTotals();});
  NewButton.appendChild(AmountInput);

  let PowerInput = document.createElement("input");
  PowerInput.className = "AmountInput";
  PowerInput.placeholder = "KMF/s";
  PowerInput.type = "number";
  PowerInput.step = "1";
  PowerInput.min = "0";
  if (Power != 0) {PowerInput.value = Power;};
  PowerInput.addEventListener("input", function(){CurrentMachines[Name].Power = parseFloat(PowerInput.value)!= NaN ? parseFloat(PowerInput.value): 0; UpdateTotals();});
  NewButton.appendChild(PowerInput);
  
  SelectedMachineButtons.appendChild(NewButton);
}

function AddMachines() {
  SelectedMachines.forEach(function(MachineButton) {
    let Offset = 1;
    let BaseName = MachineButton.value;
    let Name = BaseName;
    while (CurrentMachines[Name] != null) {
      Name = BaseName + Offset;
      Offset += 1;
    }
    NewMachineButton(MachineButton, Name);
  });
  DeselectMachines();
};

//Machine Clicked
function UpdateTotals() {
  let TotalCost = 0;
  let TotalPower = 0;
  let TotalPolution = 0;
  Object.entries(CurrentMachines).forEach(function(Data){
    let MachineData = Data[1]
    let Name = MachineData.MachineName;
    let Amount = MachineData.Amount;
    let Power = MachineData.Power;

    TotalCost += Amount*MachinesData[Name].Price;
    TotalPolution += Amount*MachinesData[Name].Pollution;
    TotalPower += Amount*Power;
  });
  
  MachinesPriceText.innerText = "Price: $"+Intl.NumberFormat("en-UK").format(TotalCost);
  MachinesPowerText.innerText = "Power: "+Intl.NumberFormat("en-UK").format(TotalPower)+" KMF/s";
  MachinesPollutionText.innerText = "Pollution: "+Intl.NumberFormat("en-UK").format(TotalPolution)+" %/hr";
};
UpdateTotals();

//////////////////////////////////////////////////////////////
//Import Export
document.getElementById("ImportMachines").onclick = function() {document.getElementById("ImportMenu").style.display = "";};
document.getElementById("ExportMachines").onclick = function() {ExportClicked();};
document.getElementById("Import").onclick = function() {ImportClicked();};

document.getElementById('ImportMenu').addEventListener('click', function(event) {
  const Menu = document.getElementById('ImportBox');
  if (Menu && !Menu.contains(event.target)) {document.getElementById('ImportMenu').style.display = 'none';};
});

function ImportClicked() {
  let Input = document.getElementById("ImportMachineInput");
  try {
    let Data = Input.value.split("⚡")
    let ExtractedData = {};

    ClearCurrentMachines();

    Data.forEach(MachineToImport => {
      if (MachineToImport == "") {return;};
      let CurrentMachine = JSON.parse(MachineToImport);

      if (CurrentMachine[1] == null) {return;};
      if (CurrentMachine[1].MachineName == null) {return;};
      if (document.getElementById(CurrentMachine[1].MachineName+"Button") == null) {return;};

      ExtractedData[CurrentMachine[0]] = CurrentMachine[1];
      NewMachineButton(document.getElementById(CurrentMachine[1].MachineName+"Button"), CurrentMachine[0], CurrentMachine[1].Amount, CurrentMachine[1].Power);
    });

    CurrentMachines = ExtractedData;
    Update();

    document.getElementById('ImportMenu').style.display = 'none';
  } catch {
    Input.value = "Invalid, Try exporting to see format!";
  };
};

function ExportClicked() {
  let ExportText = "";
  Object.entries(CurrentMachines).forEach(function(Data){
    ExportText += JSON.stringify(Data)+"⚡\n";
  });
  navigator.clipboard.writeText(ExportText);
  document.getElementById("ExportMachines").innerText = "Copied to clipboard!";
  setTimeout(() => {
  document.getElementById("ExportMachines").innerText = "Export Machines";
  }, 2000);
};

//////////////////////////////////////////////////////////////

function Update(){
  let AddMachinesString = "Selected: ";
  if (SelectedMachines.length == 0) {
    AddMachinesString += "None";
  } else {
    SelectedMachines.forEach(function(MachineButton, Index) {
      AddMachinesString+= MachineButton.value;
      if (Index != (SelectedMachines.length-1)) {
        AddMachinesString += ", ";
      };
    });
  };
  AddMachinesSelectedText.innerText = AddMachinesString;

  let CurrentMachinesString = "Selected: ";
  let IteratableMachines = Object.entries(CurrentMachines)
  if (IteratableMachines.length == 0) {
    CurrentMachinesString += "None";
  } else {
    IteratableMachines.forEach(function(MachineData, Index) {
      CurrentMachinesString+= MachineData[1].MachineName;
      if (Index != (IteratableMachines.length-1)) {
        CurrentMachinesString += ", ";
      };
    });
  };

  CurrentMachinesSelectedText.innerText = CurrentMachinesString;
  
  UpdateTotals();
};

function MachineClicked(Button) {
  if (Button.className == "DeselectedButton") {
    SelectedMachines.push(Button);
    Button.className = "SelectedButton";

  } else if (Button.className == "SelectedButton") {
    Button.className = "DeselectedButton";
    SelectedMachines.forEach(function (MachineButton, Index) {
      if (MachineButton == Button) {
        SelectedMachines.splice(Index, 1);
      };
    });
  };

  Update();
};

function DeselectMachines() {
  SelectedMachines = [];
  Machines.forEach(Machine => {
    Machine.className = "DeselectedButton";
  });
  Update();
};

function ClearCurrentMachines() {
  CurrentMachines = [];
  Array.from(SelectedMachineButtons.children).forEach(Button => {
    document.getElementById(Button.id).remove()
  });
  Update();
};