import React from "react";
import RNPickerSelect from "react-native-picker-select";
import { PickerView } from "./styles";

export default function Picker({ onChange }) {
  return (
    <PickerView>
      <RNPickerSelect
        style={{
          inputIOS: {
            height: 50,
            padding: 5,
            backgroundColor: "#FFF",
            fontSize: 16,
          },
        }}
        placeholder={{
          label: "Selecciona el tipo",
          color: "#222",
          value: null,
        }}
        onValueChange={(tipo) => onChange(tipo)}
        items={[
          { label: "Ingresos", value: "ingresos", color: "#222" },
          { label: "Gastos", value: "gastos", color: "#222" },
        ]}
      />
    </PickerView>
  );
}
