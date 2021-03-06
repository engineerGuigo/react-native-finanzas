import React, { useContext, useState, useEffect } from "react";
import { Alert, TouchableOpacity } from "react-native";
import firebase from "../../services/firebaseConnection";
import { format, isBefore } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";

import { AuthContext } from "../../contexts/auth";
import Header from "../../components/Header";
import HistorialList from "../../components/HistorialList";

import Icon from "react-native-vector-icons/MaterialIcons";
import DatePicker from "../../components/DatePicker";

import { Container, Nombre, Saldo, Title, List, Area } from "./styles";

export default function Home() {
  const [historial, setHistorial] = useState([]);
  const [saldo, setSaldo] = useState(0);

  const { user } = useContext(AuthContext);
  const uid = user && user.uid;

  const [newDate, setNewDate] = useState(new Date());
  const [show, setShow] = useState(false);

  useEffect(() => {
    async function loadList() {
      await firebase
        .database()
        .ref("users")
        .child(uid)
        .on("value", (snapshot) => {
          setSaldo(snapshot.val().saldo);
        });

      await firebase
        .database()
        .ref("historial")
        .child(uid)
        .orderByChild("date")
        .equalTo(format(new Date(), "dd/MM/yy"))
        .limitToLast(10)
        .on("value", (snapshot) => {
          setHistorial([]);

          snapshot.forEach((childItem) => {
            let list = {
              key: childItem.key,
              tipo: childItem.val().tipo,
              valor: childItem.val().valor,
              date: childItem.val().date,
            };

            setHistorial((oldArray) => [...oldArray, list].reverse());
          });
        });
    }

    loadList();
  }, [newDate]);

  function handleDelete(data) {
    const [diaItem, mesItem, anoItem] = data.date.split("/");
    const dateItem = new Date(`${anoItem}/${mesItem}/${diaItem}`);
    console.log(dateItem);

    const formatDiaHoje = format(new Date(), "dd/MM/yyyy");
    const [diaHoy, mesHoy, anoHoy] = formatDiaHoje.split("/");
    const dateHoy = new Date(`${anoHoy}/${mesHoy}/${diaHoy}`);
    console.log(dateHoy);

    if (isBefore(dateItem, dateHoy)) {
      alert("¡No puedes eliminar un registro antiguo!");
      return;
    }

    Alert.alert(
      "Cuidado!",
      `Deseas eliminar ${data.tipo} ? - Valor: ${data.valor}`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Continuar",
          onPress: () => handleDeleteSuccess(data),
        },
      ]
    );
  }

  async function handleDeleteSuccess(data) {
    await firebase
      .database()
      .ref("historial")
      .child(uid)
      .child(data.key)
      .remove()
      .then(async () => {
        let saldoActual = saldo;
        data.tipo === "gastos"
          ? (saldoActual += parseFloat(data.valor))
          : (saldoActual -= parseFloat(data.valor));

        await firebase
          .database()
          .ref("users")
          .child(uid)
          .child("saldo")
          .set(saldoActual);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleShowPicker() {
    setShow(true);
  }

  function handleClose() {
    setShow(false);
  }

  const onChange = (date) => {
    setShow(Platform.OS === "ios");
    setNewDate(date);
    console.log(date);
  };

  return (
    <LinearGradient
      colors={["#464769", "#1B1A1F"]}
      style={{
        flex: 1,
        paddingTop: 50,
      }}
    >
      <Header />
      <Container>
        <Nombre>{user && user.nombre}</Nombre>
        <Saldo>
          $ {saldo.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")}
        </Saldo>
      </Container>

      <Area>
        <TouchableOpacity onPress={handleShowPicker}>
          <Icon name="event" color="#FFF" size={30} />
        </TouchableOpacity>
        <Title>Ultimas movimentaciones</Title>
      </Area>

      <List
        showsVerticalScrollIndicator={false}
        data={historial}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <HistorialList data={item} deleteItem={handleDelete} />
        )}
      />

      {show && (
        <DatePicker onClose={handleClose} date={newDate} onChange={onChange} />
      )}
    </LinearGradient>
  );
}
